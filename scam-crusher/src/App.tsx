import { useState, useEffect } from 'react'
import { useCurrentAccount, useSuiClient, useSignAndExecuteTransaction } from '@mysten/dapp-kit'
import { Transaction } from '@mysten/sui/transactions'

import Navbar from './components/Navbar'
import CrushReceipt from './components/CrushReceipt'
import Home from './pages/Home'
import Crusher from './pages/Crusher'
import Assets from './pages/Assets'
import Board from './pages/board/Board'
import Roulette from './pages/Roulette'

const PACKAGE_ID = '0x69d9f09680a1af2a441c2b69fb868cdec6bd0636ab607db13f4642be0d8eb04c'
const NFT_PACKAGE_ID = '0x69d9f09680a1af2a441c2b69fb868cdec6bd0636ab607db13f4642be0d8eb04c'
const COLLECTION_CONFIG_ID = '0xccb4139e4ef0bbd2c1d72ed91d833497f4283a54c0cf51cbe8ff00db6e878d1e'

type Tab = 'home' | 'crusher' | 'assets' | 'board' | 'roulette'

export default function App() {
  const account = useCurrentAccount()
  const client = useSuiClient()
  const { mutate: signAndExecute } = useSignAndExecuteTransaction()

  const [tab, setTab] = useState<Tab>('home')
  const [nfts, setNfts] = useState<any[]>([])
  const [objects, setObjects] = useState<any[]>([])
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
  const [nftPage, setNftPage] = useState(0)
  const [, setBgLoaded] = useState(false)
  const [mintSuccess, setMintSuccess] = useState(false)
  const [lastMintedSerial, setLastMintedSerial] = useState<number | null>(null)
  const [crushReceipt, setCrushReceipt] = useState<{ totalCrushes: number; pointsGained: number; targetImage: string | null } | null>(null)

  const openMockReceipt = () => setCrushReceipt({
    totalCrushes: 540,
    pointsGained: 54,
    targetImage: null,
  })

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
    signAndExecute({ transaction: tx }, {
      onSuccess: async () => {
        console.log('mint success fired, minted:', minted)
        await fetchCollectionInfo()
        setMinting(false)
        loadAssets()
        setMintSuccess(true)
        setLastMintedSerial(minted + 1)
        setAssetsStatus('')
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

  const toggleTarget = (id: string) => {
    setSelectedTargets(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const crush = async () => {
    if (nfts.length === 0 || selectedTargets.size === 0 || !account) return

    const targetList = objects.filter(o => selectedTargets.has(o.data.objectId))
    const tx = new Transaction()

    // All NFTs are from kiosks — group them by kiosk so we can call crush_all per kiosk
    const kioskGroups = new Map<string, { kCapId: string; iv: number; nftIds: string[] }>()

    for (const nft of nfts) {
      const kId = (nft as any)._kioskId
      const kCapId = (nft as any)._kioskCapId
      if (!kioskGroups.has(kId)) {
        const kioskObj = await client.getObject({ id: kId, options: { showOwner: true } })
        const iv = (kioskObj.data?.owner as any)?.Shared?.initial_shared_version
        kioskGroups.set(kId, { kCapId, iv, nftIds: [] })
      }
      kioskGroups.get(kId)!.nftIds.push(nft.data.objectId)
    }

    let commandIndex = 0

    for (const target of targetList) {

      // STEP 1:
      // Every NFT gets a point first
      for (const [kId, { kCapId, iv, nftIds }] of kioskGroups) {


        for (const nftId of nftIds) {

          tx.moveCall({
            target: `${PACKAGE_ID}::crusher::record_point_in_kiosk`,
            typeArguments: [target.data.type],
            arguments: [
              tx.sharedObjectRef({
                objectId: kId,
                initialSharedVersion: iv,
                mutable: true,
              }),
              tx.object(kCapId),
              tx.pure.id(nftId),

              // IMPORTANT:
              // fresh object reference every time
              tx.object(target.data.objectId),

              tx.object(COLLECTION_CONFIG_ID),
            ],
          })

          commandIndex++
        }
      }

      // STEP 2:
      // Delete target ONLY ONCE
      const firstEntry = kioskGroups.entries().next().value

      if (firstEntry) {
        const [kId, kioskData] = firstEntry
        const { kCapId, iv, nftIds } = kioskData

        const [payment] = tx.splitCoins(tx.gas, [
          tx.pure.u64(crushFee),
        ])

    
        commandIndex++

        

        tx.moveCall({
          target: `${PACKAGE_ID}::crusher::delete_target_from_kiosk`,
          typeArguments: [target.data.type],
          arguments: [
            tx.sharedObjectRef({
              objectId: kId,
              initialSharedVersion: iv,
              mutable: true,
            }),
            tx.object(kCapId),
            tx.pure.id(nftIds[0]),

            // THIS ONE consumes target
            tx.object(target.data.objectId),

            payment,
            tx.object(COLLECTION_CONFIG_ID),
          ],
        })

        commandIndex++

        console.log(
          `  [cmd ${commandIndex}] transferObjects payment`
        )

        tx.transferObjects(
          [payment],
          tx.pure.address(account.address)
        )

        commandIndex++
      }
    }


    await new Promise<void>(resolve => {
      signAndExecute({ transaction: tx }, {
        onSuccess: r => {
          setCrusherStatus(`CRUSHED — all ${nfts.length} NFTs got points — ${r.digest}`)
          const firstTarget = targetList[0]
          const pointsGained = nfts.length
          const currentTotal = nfts.reduce(
            (s: number, n: any) => s + Number(n.data.content?.fields?.crush_count ?? 0), 0
          )
          setCrushReceipt({
            totalCrushes: currentTotal + pointsGained,
            pointsGained,
            targetImage: firstTarget ? getImage(firstTarget) : null,
          })
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
    window.scrollTo({ top: 0, behavior: 'smooth' })
    if (tab === 'board') loadLeaderboard()
    if (tab === 'assets' && account) loadAssets()
  }, [tab, account])

  const getImage = (obj: any) =>
    obj.data?.display?.data?.image_url || obj.data?.content?.fields?.image_url || null

  const canCrush = nfts.length > 0 && selectedTargets.size > 0
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
          selectedTargets={selectedTargets}
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

          nftPage={nftPage}
          setNftPage={setNftPage}

          getImage={getImage}
          onMockReceipt={openMockReceipt}
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
          mintSuccess={mintSuccess}
          lastMintedSerial={lastMintedSerial}
          onDismissMint={() => {
            setMintSuccess(false)
            setLastMintedSerial(null)
            setTab('crusher')
          }}
          onStayOnMint={() => {
            setMintSuccess(false)
            setLastMintedSerial(null)
          }}
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
      {tab === 'roulette' && <Roulette account={account} />}

      {crushReceipt && (
        <CrushReceipt
          totalCrushes={crushReceipt.totalCrushes}
          pointsGained={crushReceipt.pointsGained}
          targetImage={crushReceipt.targetImage}
          onClose={() => setCrushReceipt(null)}
        />
      )}

      <Navbar tab={tab} setTab={setTab} />
    </div>
  )
}