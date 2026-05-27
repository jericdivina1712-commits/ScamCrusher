import { useState, useEffect } from 'react'
import { useCurrentAccount, useSuiClient, useSignAndExecuteTransaction } from '@mysten/dapp-kit'
import { Transaction } from '@mysten/sui/transactions'

import Navbar from './components/Navbar'
import Home from './pages/Home'
import Crusher from './pages/Crusher'
import Assets from './pages/Assets'
import Board from './pages/board/Board'

const PACKAGE_ID = '0x69d9f09680a1af2a441c2b69fb868cdec6bd0636ab607db13f4642be0d8eb04c'
const NFT_PACKAGE_ID = '0x69d9f09680a1af2a441c2b69fb868cdec6bd0636ab607db13f4642be0d8eb04c'
const COLLECTION_CONFIG_ID = '0xccb4139e4ef0bbd2c1d72ed91d833497f4283a54c0cf51cbe8ff00db6e878d1e'

type Tab = 'home' | 'crusher' | 'assets' | 'board'

export default function App() {
  const account = useCurrentAccount()
  const client = useSuiClient()
  const { mutate: signAndExecute } = useSignAndExecuteTransaction()

  const [tab, setTab] = useState<Tab>('home')
  const [nfts, setNfts] = useState<any[]>([])
  const [objects, setObjects] = useState<any[]>([])
  const [selectedNfts, setSelectedNfts] = useState<Set<string>>(new Set())
  const [selectedTargets, setSelectedTargets] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [crusherStatus, setCrusherStatus] = useState('')
  const [assetsStatus, setAssetsStatus] = useState('')
  const [minting, setMinting] = useState(false)
  const [mintCount, setMintCount] = useState(1)
  const [poolAmount, setPoolAmount] = useState(0)
  const [crushFee, setCrushFee] = useState(0)
  const [mintPrice, setMintPrice] = useState(10000000000)
  const [minted, setMinted] = useState(0)
  const [maxSupply, setMaxSupply] = useState(1000)
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [lbLoading, setLbLoading] = useState(false)
  const [siteActive] = useState<boolean>(true)
  const [objectPage, setObjectPage] = useState(0)
  const [, setBgLoaded] = useState(false)

  const loadLeaderboard = async () => {
    setLbLoading(true)
    try {
      const nftMap = new Map<string, { crusher: string; crush_count: number; rarity: string }>()
      let cursor: string | undefined = undefined
      let hasNext = true
      while (hasNext) {
        const res: any = await client.queryEvents({
          query: { MoveEventType: `${NFT_PACKAGE_ID}::crusher::CrushEvent` },
          cursor: cursor as any,
          limit: 50,
        })
        for (const ev of res.data) {
          const j = ev.parsedJson as any
          if (!j?.crusher || !j?.nft_id) continue
          const existing = nftMap.get(j.nft_id)
          if (!existing || Number(j.crush_count) > existing.crush_count) {
            nftMap.set(j.nft_id, {
              crusher: j.crusher,
              crush_count: Number(j.crush_count),
              rarity: j.rarity ?? 'COMMON',
            })
          }
        }
        hasNext = res.hasNextPage
        cursor = res.nextCursor
      }
      const crusherMap = new Map<string, { owner: string; total: number }>()
      for (const [, nft] of nftMap) {
        const e = crusherMap.get(nft.crusher) ?? { owner: nft.crusher, total: 0 }
        e.total += nft.crush_count
        crusherMap.set(nft.crusher, e)
      }
      const walletRanking = Array.from(crusherMap.values()).sort((a, b) => b.total - a.total)
      setLeaderboard(walletRanking)
    } catch (e: any) {
      console.error(e)
      setLeaderboard([{ objectId: 'err', serial: 0, rarity: e.message, crush_count: 0, owner: '' }])
    }
    setLbLoading(false)
  }

  const fetchCollectionInfo = async () => {
    try {
      const cfg = await client.getObject({ id: COLLECTION_CONFIG_ID, options: { showContent: true } })
      const fields = (cfg.data?.content as any)?.fields
      setPoolAmount(Number(fields?.pool ?? 0))
      setMinted(Number(fields?.minted ?? 0))
      setCrushFee(Number(fields?.crush_fee ?? 0))
      setMaxSupply(Number(fields?.max_supply ?? 1000))
      setMintPrice(Number(fields?.mint_price ?? 10000000000))
    } catch {}
  }

  const mint = async () => {
    console.log('mint fired, account:', account)
    if (!account) return
    setMinting(true)
    setAssetsStatus('')
    const tx = new Transaction()
    const [kiosk, kioskCap] = tx.moveCall({ target: '0x2::kiosk::new', arguments: [] })
    for (let i = 0; i < mintCount; i++) {
      const [payment] = tx.splitCoins(tx.gas, [tx.pure.u64(mintPrice)])
      tx.moveCall({
        target: `${PACKAGE_ID}::crusher::mint_to_kiosk`,
        arguments: [tx.object(COLLECTION_CONFIG_ID), payment, kiosk, kioskCap],
      })
      tx.transferObjects([payment], tx.pure.address(account.address))
    }
    tx.transferObjects([kioskCap], tx.pure.address(account.address))
    tx.moveCall({
      target: '0x2::transfer::public_share_object',
      typeArguments: ['0x2::kiosk::Kiosk'],
      arguments: [kiosk],
    })
    console.log('about to signAndExecute, tx:', tx)
    signAndExecute({ transaction: tx }, {
      onSuccess: async (r: any) => {
        setAssetsStatus(`MINTED ${mintCount} — ${r.digest}`)
        await fetchCollectionInfo()
        setMinting(false)
        loadAssets()
      },
      onError: (e: any) => {
        setAssetsStatus('ERROR: ' + e.message)
        setMinting(false)
      },
    })
  }

  const loadAssets = async () => {
    if (!account) return
    setLoading(true)
    await fetchCollectionInfo()

    // Paginate through ALL owned objects
    let all: any[] = []
    let ownedCursor: string | undefined = undefined
    let ownedHasNext = true
    while (ownedHasNext) {
      const res = await client.getOwnedObjects({
        owner: account.address,
        options: { showType: true, showContent: true, showDisplay: true },
        cursor: ownedCursor as any,
        limit: 50,
      })
      all = [...all, ...res.data]
      ownedHasNext = res.hasNextPage
      ownedCursor = res.nextCursor ?? undefined
    }
    console.log('total owned objects:', all.length)

    // Bug fix #1: filter by type, not hardcoded object ID
    const kioskCaps = all.filter(
      (o: any) =>
        o.data?.type?.includes('::kiosk::KioskOwnerCap') ||
        o.data?.type?.includes('0x2::kiosk::KioskOwnerCap')
    )

    const kioskNfts: any[] = []
    for (const cap of kioskCaps) {
      // Bug fix #1: removed VALID_CAP hardcoded ID check — now accepts any valid kiosk cap
      if (!cap.data?.type?.includes('KioskOwnerCap')) continue
      const kId =
        (cap.data?.content as any)?.fields?.for ??
        (cap.data?.content as any)?.['fields']?.for ??
        (cap as any)?.data?.content?.fields?.for
      const kCapId = cap.data?.objectId
      if (!kId) continue
      try {
        let dfCursor: string | undefined = undefined
        let dfHasNext = true
        while (dfHasNext) {
          const dfRes: any = await client.getDynamicFields({ parentId: kId, cursor: dfCursor as any, limit: 50 })
          const nftIds = dfRes.data.filter(() => true).map((df: any) => df.objectId)
          if (nftIds.length > 0) {
            const objs = await client.multiGetObjects({
              ids: nftIds,
              options: { showContent: true, showDisplay: true, showType: true, showOwner: true },
            })
            console.log('kiosk objects found:', objs.map((o:any) => o.data?.type))
            kioskNfts.push(
              ...objs
                .filter((o: any) => o.data?.type?.includes('CrusherNFT'))
                .map((o: any) => ({ ...o, _kioskId: kId, _kioskCapId: kCapId }))
            )
          }
          dfHasNext = dfRes.hasNextPage
          dfCursor = dfRes.nextCursor
        }
      } catch (e) {
        console.error('kiosk fetch error', e)
      }
    }

    const allNfts = [...kioskNfts]
    setNfts(allNfts)
    if (allNfts.length > 0) setSelectedNfts(new Set([allNfts[0].data!.objectId]))

    setObjects(
      all.filter(
        (o: any) =>
          !o.data?.type?.includes('CrusherNFT') &&
          !o.data?.type?.includes('::coin::Coin') &&
          !o.data?.type?.includes('Blob') &&
          !o.data?.type?.includes('blob') &&
          !o.data?.type?.includes('UpgradeCap') &&
          !o.data?.type?.includes('AdminCap') &&
          !o.data?.type?.includes('KioskOwnerCap') &&
          !o.data?.type?.includes('Publisher') &&
          !o.data?.type?.includes('SiteStatus') &&
          !o.data?.type?.includes('::site::') &&
          !o.data?.type?.includes('TreasuryCap') &&
          !o.data?.type?.includes('::package::Publisher') &&
          !o.data?.type?.includes('::package::UpgradeCap') &&
          !o.data?.type?.includes('storage_resource::Storage')
      )
    )
    setSelectedTargets(new Set())
    setLoading(false)
  }

  const toggleNft = (id: string) => {
    setSelectedNfts(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const toggleTarget = (id: string) => {
    setSelectedTargets(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const crush = async () => {
    console.log('crush fired')
    console.log('selectedNfts:', [...selectedNfts])
    console.log('selectedTargets:', [...selectedTargets])
    console.log('account:', account)
    if (selectedNfts.size === 0 || selectedTargets.size === 0 || !account) {
      console.log('early exit — nfts:', selectedNfts.size, 'targets:', selectedTargets.size, 'account:', !!account)
      return
    }
    const nftList = nfts.filter((n: any) => selectedNfts.has(n.data.objectId))
    const targetList = objects.filter(o => selectedTargets.has(o.data.objectId))
    console.log('nftList:', nftList.length, 'targetList:', targetList.length)
    const tx = new Transaction()
    for (const target of targetList) {
      for (const nft of nftList) {
        const kId = (nft as any)._kioskId
        const kCapId = (nft as any)._kioskCapId
        console.log('kId:', kId, 'kCapId:', kCapId, 'nftId:', nft.data.objectId)

        // Bug fix #3: always fetch iv dynamically, never hardcode
        const kioskObj2 = await client.getObject({ id: kId, options: { showOwner: true } })
        const iv = (kioskObj2.data?.owner as any)?.Shared?.initial_shared_version
        console.log('iv:', iv)

        tx.moveCall({
          target: `${PACKAGE_ID}::crusher::record_point_in_kiosk`,
          typeArguments: [target.data.type],
          arguments: [
            tx.sharedObjectRef({ objectId: kId, initialSharedVersion: iv, mutable: true }),
            tx.object(kCapId),
            tx.pure.id(nft.data.objectId),
            tx.object(target.data.objectId),
            tx.object(COLLECTION_CONFIG_ID),
          ],
        })
        const [payment] = tx.splitCoins(tx.gas, [tx.pure.u64(100000000)])
        tx.moveCall({
          target: `${PACKAGE_ID}::crusher::delete_target_from_kiosk`,
          typeArguments: [target.data.type],
          arguments: [
            tx.sharedObjectRef({ objectId: kId, initialSharedVersion: iv, mutable: true }),
            tx.object(kCapId),
            tx.pure.id(nft.data.objectId),
            tx.object(target.data.objectId),
            payment,
            tx.object(COLLECTION_CONFIG_ID),
          ],
        })
        tx.transferObjects([payment], tx.pure.address(account.address))
      }
    }
    console.log('built tx, calling signAndExecute now')
    await new Promise<void>(resolve => {
      signAndExecute({ transaction: tx }, {
        onSuccess: r => {
          setCrusherStatus(`CRUSHED ${nftList.length * targetList.length} — ${r.digest}`)
          resolve()
        },
        onError: e => {
          setCrusherStatus('ERROR: ' + e.message)
          resolve()
        },
      })
    })
    loadAssets()
  }

//   useEffect(() => {
//     fetch('https://fullnode.mainnet.sui.io', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({
//         jsonrpc: '2.0', id: 1, method: 'sui_getObject',
//         params: ['0x2933d6b633ff32534eedb119eff307219455ec475f78580fa99e5b25d828e7a6', { showContent: true }],
//       }),
//     })
//       .then(r => r.json())
//       .then(d => {
//   console.log('siteActive fields:', d?.result?.data?.content?.fields)
//   if (d?.result?.data?.content?.fields?.active === false) setSiteActive(false)
// })
//       .catch(() => {})
//   }, [])

  useEffect(() => { fetchCollectionInfo() }, [])

  useEffect(() => {
    const img = new Image()
    img.src = 'https://aggregator.walrus-mainnet.walrus.space/v1/blobs/vrD2axdK0w3RZKPpYD9TtP50TwsXiRVDZmrDC2RjWlE'
    img.onload = () => setBgLoaded(true)
  }, [])

  useEffect(() => {
    if (tab === 'board') loadLeaderboard()
    if (tab === 'assets' && account) loadAssets()
  }, [tab, account])

  const getImage = (obj: any) =>
    obj.data?.display?.data?.image_url || obj.data?.content?.fields?.image_url || null

  const canCrush = selectedNfts.size > 0 && selectedTargets.size > 0
  const remaining = maxSupply - minted

 return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      background: '#050f23',
      color: '#e8f0ff',
      fontFamily: 'Georgia, serif',
    }}>
      {tab === 'home' && <Home setTab={setTab} />}
      {tab === 'crusher' && (
        <Crusher
          account={account}
          nfts={nfts}
          objects={objects}
          selectedNfts={selectedNfts}
          selectedTargets={selectedTargets}
          toggleNft={toggleNft}
          toggleTarget={toggleTarget}
          crush={crush}
          canCrush={canCrush}
          siteActive={siteActive}
          crushFee={crushFee}
          loading={loading}
          loadAssets={loadAssets}
          status={crusherStatus}
          objectPage={objectPage}
          setObjectPage={setObjectPage}
          getImage={getImage}
        />
      )}
      {tab === 'assets' && (
        <Assets
          account={account}
          nfts={nfts}
          minted={minted}
          maxSupply={maxSupply}
          remaining={remaining}
          poolAmount={poolAmount}
          mintPrice={mintPrice}
          mintCount={mintCount}
          setMintCount={setMintCount}
          mint={mint}
          minting={minting}
          siteActive={siteActive}
          status={assetsStatus}
          getImage={getImage}
        />
      )}
      {tab === 'board' && (
        <Board
          account={account}
          leaderboard={leaderboard}
          lbLoading={lbLoading}
          loadLeaderboard={loadLeaderboard}
        />
      )}

      <Navbar tab={tab} setTab={setTab} />
    </div>
  )
}