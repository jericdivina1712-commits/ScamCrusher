module crusher::crusher {
    use std::string::{Self, String};
    use sui::balance::{Self, Balance};
    use sui::coin::{Self, Coin};
    use sui::display;
    use sui::event;
    use sui::kiosk::{Self, Kiosk, KioskOwnerCap};
    use sui::object::{Self, UID, ID};
    use sui::package;
    use sui::sui::SUI;
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::url::{Self, Url};

    // ── One-time witness ──────────────────────────────────────────────
    public struct CRUSHER has drop {}

    // ── Structs ───────────────────────────────────────────────────────
    public struct AdminCap has key, store {
        id: UID,
    }

    public struct CollectionConfig has key {
        id: UID,
        admin: address,
        minted: u64,
        max_supply: u64,
        mint_price: u64,
        crush_fee: u64,
        pool: Balance<SUI>,
    }

    public struct CrusherNFT has key, store {
        id: UID,
        name: String,
        description: String,
        url: Url,
        crush_count: u64,
        rarity: String,
        serial: u64,
    }

    // ── Events ────────────────────────────────────────────────────────
    public struct CrushEvent has copy, drop {
        nft_id: ID,
        target_id: ID,
        crusher: address,
        crush_count: u64,
        rarity: String,
    }

    public struct MintEvent has copy, drop {
        nft_id: ID,
        minter: address,
        serial: u64,
    }

    // ── Error codes ───────────────────────────────────────────────────
    const EInsufficientPayment: u64 = 1;
    const ESoldOut: u64 = 2;
    const EInsufficientPoolBalance: u64 = 3;

    // ── Init ──────────────────────────────────────────────────────────
    fun init(witness: CRUSHER, ctx: &mut TxContext) {
        let sender = tx_context::sender(ctx);

        // Claim publisher and set up display
        let publisher = package::claim(witness, ctx);
        let mut display = display::new<CrusherNFT>(&publisher, ctx);
        display::add(&mut display, string::utf8(b"name"), string::utf8(b"{name}"));
        display::add(&mut display, string::utf8(b"description"), string::utf8(b"{description}"));
        display::add(&mut display, string::utf8(b"image_url"), string::utf8(b"{url}"));
        display::add(&mut display, string::utf8(b"project_url"), string::utf8(b"https://tokunori.wal.app"));
        display::update_version(&mut display);

        transfer::public_transfer(publisher, sender);
        transfer::public_transfer(display, sender);

        // Admin cap
        transfer::transfer(AdminCap { id: object::new(ctx) }, sender);

        // Shared collection config
        // mint_price: 10 SUI = 10_000_000_000 MIST
        // crush_fee:  0.1 SUI = 100_000_000 MIST
        transfer::share_object(CollectionConfig {
            id: object::new(ctx),
            admin: sender,
            minted: 0,
            max_supply: 1000,
            mint_price: 1_000_000,
            crush_fee: 1_000_000,
            pool: balance::zero<SUI>(),
        });
    }

    // ── Internal helpers ──────────────────────────────────────────────
    fun get_rarity(crush_count: u64): String {
        if (crush_count >= 500) {
            string::utf8(b"LEGEND")
        } else if (crush_count >= 200) {
            string::utf8(b"EPIC")
        } else if (crush_count >= 50) {
            string::utf8(b"RARE")
        } else {
            string::utf8(b"COMMON")
        }
    }

    fun get_url(crush_count: u64): Url {
        if (crush_count >= 500) {
            url::new_unsafe_from_bytes(b"https://pink-added-bovid-23.mypinata.cloud/ipfs/bafybeigky3iu3zwo7k7lzueyy5kduuwsc7jrag6hkxnann25w63btjafvq")
        } else if (crush_count >= 200) {
            url::new_unsafe_from_bytes(b"https://pink-added-bovid-23.mypinata.cloud/ipfs/bafybeihxez6ozvrvmg7sapvxw3adt2g7yfhvq635ehkj6bqlldc36jm2ya")
        } else if (crush_count >= 50) {
            url::new_unsafe_from_bytes(b"https://pink-added-bovid-23.mypinata.cloud/ipfs/bafybeif5ekrt3ixcmj4ndzf4hoeg6bjzliodg6jp6vwris4cjyb7vate6y")
        } else {
            url::new_unsafe_from_bytes(b"https://pink-added-bovid-23.mypinata.cloud/ipfs/bafybeietaedemjbeid2e4a4hvvf5zh2em6mn3d47n43nfri6mwe7kiesvm")
        }
    }

    // ── Mint (direct to wallet) ───────────────────────────────────────
    public fun mint(
        config: &mut CollectionConfig,
        payment: &mut Coin<SUI>,
        ctx: &mut TxContext,
    ) {
        assert!(coin::value(payment) >= config.mint_price, EInsufficientPayment);
        assert!(config.minted < config.max_supply, ESoldOut);

        let paid = coin::split(payment, config.mint_price, ctx);
        balance::join(&mut config.pool, coin::into_balance(paid));

        config.minted = config.minted + 1;
        let serial = config.minted;

        let nft = CrusherNFT {
            id: object::new(ctx),
            name: string::utf8(b"Scam Crusher"),
            description: string::utf8(b"Crush scams on SUI. The more you crush, the rarer you become."),
            url: get_url(0),
            crush_count: 0,
            rarity: get_rarity(0),
            serial,
        };

        event::emit(MintEvent {
            nft_id: object::id(&nft),
            minter: tx_context::sender(ctx),
            serial,
        });

        transfer::public_transfer(nft, tx_context::sender(ctx));
    }

    // ── Mint into kiosk ───────────────────────────────────────────────
    public fun mint_to_kiosk(
        config: &mut CollectionConfig,
        payment: &mut Coin<SUI>,
        kiosk: &mut Kiosk,
        kiosk_cap: &KioskOwnerCap,
        ctx: &mut TxContext,
    ) {
        assert!(coin::value(payment) >= config.mint_price, EInsufficientPayment);
        assert!(config.minted < config.max_supply, ESoldOut);

        let paid = coin::split(payment, config.mint_price, ctx);
        balance::join(&mut config.pool, coin::into_balance(paid));

        config.minted = config.minted + 1;
        let serial = config.minted;

        let nft = CrusherNFT {
            id: object::new(ctx),
            name: string::utf8(b"Scam Crusher"),
            description: string::utf8(b"Crush scams on SUI. The more you crush, the rarer you become."),
            url: get_url(0),
            crush_count: 0,
            rarity: get_rarity(0),
            serial,
        };

        event::emit(MintEvent {
            nft_id: object::id(&nft),
            minter: tx_context::sender(ctx),
            serial,
        });

        kiosk::place(kiosk, kiosk_cap, nft);
    }

    // ── Record point (NFT in wallet) ──────────────────────────────────
    public fun record_point<T: key + store>(
        nft: &mut CrusherNFT,
        target: &T,
        _config: &mut CollectionConfig,
        ctx: &mut TxContext,
    ) {
        nft.crush_count = nft.crush_count + 1;
        nft.rarity = get_rarity(nft.crush_count);
        nft.url = get_url(nft.crush_count);

        event::emit(CrushEvent {
            nft_id: object::id(nft),
            target_id: object::id(target),
            crusher: tx_context::sender(ctx),
            crush_count: nft.crush_count,
            rarity: nft.rarity,
        });
    }

    // ── Record point (NFT in kiosk) ───────────────────────────────────
    public fun record_point_in_kiosk<T: key + store>(
        kiosk: &mut Kiosk,
        kiosk_cap: &KioskOwnerCap,
        nft_id: ID,
        target: &T,
        _config: &mut CollectionConfig,
        ctx: &mut TxContext,
    ) {
        let nft = kiosk::borrow_mut<CrusherNFT>(kiosk, kiosk_cap, nft_id);

        nft.crush_count = nft.crush_count + 1;
        nft.rarity = get_rarity(nft.crush_count);
        nft.url = get_url(nft.crush_count);

        event::emit(CrushEvent {
            nft_id: object::id(nft),
            target_id: object::id(target),
            crusher: tx_context::sender(ctx),
            crush_count: nft.crush_count,
            rarity: nft.rarity,
        });
    }

    // ── Delete target (NFT in wallet) ─────────────────────────────────
    public fun delete_target<T: key + store>(
        target: T,
        payment: &mut Coin<SUI>,
        config: &mut CollectionConfig,
        ctx: &mut TxContext,
    ) {
        assert!(coin::value(payment) >= config.crush_fee, EInsufficientPayment);

        let fee = coin::split(payment, config.crush_fee, ctx);
        balance::join(&mut config.pool, coin::into_balance(fee));

        transfer::public_transfer(target, @0x0);
    }

    // ── Delete target from kiosk ──────────────────────────────────────
    public fun delete_target_from_kiosk<T: key + store>(
        kiosk: &mut Kiosk,
        kiosk_cap: &KioskOwnerCap,
        nft_id: ID,
        target: T,
        payment: &mut Coin<SUI>,
        config: &mut CollectionConfig,
        ctx: &mut TxContext,
    ) {
        let nft = kiosk::borrow_mut<CrusherNFT>(kiosk, kiosk_cap, nft_id);

        nft.crush_count = nft.crush_count + 1;
        nft.rarity = get_rarity(nft.crush_count);
        nft.url = get_url(nft.crush_count);

        assert!(coin::value(payment) >= config.crush_fee, EInsufficientPayment);
        let fee = coin::split(payment, config.crush_fee, ctx);
        balance::join(&mut config.pool, coin::into_balance(fee));

        event::emit(CrushEvent {
            nft_id: object::id(nft),
            target_id: object::id(&target),
            crusher: tx_context::sender(ctx),
            crush_count: nft.crush_count,
            rarity: nft.rarity,
        });

        transfer::public_transfer(target, @0x0);
    }

    // ── Execute crush (all-in-one, NFT in wallet) ─────────────────────
    public fun execute_crush<T: key + store>(
        nft: &mut CrusherNFT,
        target: T,
        payment: &mut Coin<SUI>,
        config: &mut CollectionConfig,
        ctx: &mut TxContext,
    ) {
        assert!(coin::value(payment) >= config.crush_fee, EInsufficientPayment);

        let fee = coin::split(payment, config.crush_fee, ctx);
        balance::join(&mut config.pool, coin::into_balance(fee));

        let target_id = object::id(&target);
        transfer::public_transfer(target, @0x0);

        nft.crush_count = nft.crush_count + 1;
        nft.rarity = get_rarity(nft.crush_count);
        nft.url = get_url(nft.crush_count);

        event::emit(CrushEvent {
            nft_id: object::id(nft),
            target_id,
            crusher: tx_context::sender(ctx),
            crush_count: nft.crush_count,
            rarity: nft.rarity,
        });
    }

    // ── Crush another CrusherNFT ──────────────────────────────────────
    public fun crush_nft(
        nft: &mut CrusherNFT,
        target: CrusherNFT,
        _payment: &mut Coin<SUI>,
        _config: &mut CollectionConfig,
        ctx: &mut TxContext,
    ) {
        let target_id = object::id(&target);
        let CrusherNFT { id, name: _, description: _, url: _, crush_count: _, rarity: _, serial: _ } = target;
        object::delete(id);

        nft.crush_count = nft.crush_count + 1;
        nft.rarity = get_rarity(nft.crush_count);
        nft.url = get_url(nft.crush_count);

        event::emit(CrushEvent {
            nft_id: object::id(nft),
            target_id,
            crusher: tx_context::sender(ctx),
            crush_count: nft.crush_count,
            rarity: nft.rarity,
        });
    }

    // ── Batch crush ───────────────────────────────────────────────────
    public fun batch_crush<T: key + store>(
        nft: &mut CrusherNFT,
        target: T,
        count: u64,
        payment: &mut Coin<SUI>,
        config: &mut CollectionConfig,
        ctx: &mut TxContext,
    ) {
        assert!(coin::value(payment) >= config.crush_fee, EInsufficientPayment);
        assert!(count >= 1, EInsufficientPayment);

        let fee = coin::split(payment, config.crush_fee, ctx);
        balance::join(&mut config.pool, coin::into_balance(fee));

        let target_id = object::id(&target);
        transfer::public_transfer(target, @0x0);

        nft.crush_count = nft.crush_count + count;
        nft.rarity = get_rarity(nft.crush_count);
        nft.url = get_url(nft.crush_count);

        event::emit(CrushEvent {
            nft_id: object::id(nft),
            target_id,
            crusher: tx_context::sender(ctx),
            crush_count: nft.crush_count,
            rarity: nft.rarity,
        });
    }

    // ── Crush all (vector of NFTs, one target) ────────────────────────
    public fun crush_all<T: key + store>(
        nfts: &mut vector<CrusherNFT>,
        target: T,
        payment: &mut Coin<SUI>,
        config: &mut CollectionConfig,
        ctx: &mut TxContext,
    ) {
        assert!(coin::value(payment) >= config.crush_fee, EInsufficientPayment);

        let fee = coin::split(payment, config.crush_fee, ctx);
        balance::join(&mut config.pool, coin::into_balance(fee));

        let target_id = object::id(&target);
        transfer::public_transfer(target, @0x0);

        let len = vector::length(nfts);
        let mut i = 0;
        while (i < len) {
            let nft = vector::borrow_mut(nfts, i);
            nft.crush_count = nft.crush_count + 1;
            nft.rarity = get_rarity(nft.crush_count);
            nft.url = get_url(nft.crush_count);

            event::emit(CrushEvent {
                nft_id: object::id(nft),
                target_id,
                crusher: tx_context::sender(ctx),
                crush_count: nft.crush_count,
                rarity: nft.rarity,
            });

            i = i + 1;
        };
    }

    // ── Deposit to pool ───────────────────────────────────────────────
    public fun deposit(
        config: &mut CollectionConfig,
        payment: &mut Coin<SUI>,
        amount: u64,
        ctx: &mut TxContext,
    ) {
        let deposited = coin::split(payment, amount, ctx);
        balance::join(&mut config.pool, coin::into_balance(deposited));
    }

    // ── Admin functions ───────────────────────────────────────────────
    public fun withdraw(
        _cap: &AdminCap,
        config: &mut CollectionConfig,
        amount: u64,
        ctx: &mut TxContext,
    ) {
        assert!(balance::value(&config.pool) >= amount, EInsufficientPoolBalance);
        let withdrawn = balance::split(&mut config.pool, amount);
        transfer::public_transfer(coin::from_balance(withdrawn, ctx), config.admin);
    }

    public fun update_mint_price(
        _cap: &AdminCap,
        config: &mut CollectionConfig,
        new_price: u64,
    ) {
        config.mint_price = new_price;
    }

    public fun update_crush_fee(
        _cap: &AdminCap,
        config: &mut CollectionConfig,
        new_fee: u64,
    ) {
        config.crush_fee = new_fee;
    }

    public fun update_max_supply(
        _cap: &AdminCap,
        config: &mut CollectionConfig,
        new_max: u64,
    ) {
        config.max_supply = new_max;
    }

    public fun reset_minted(
        _cap: &AdminCap,
        config: &mut CollectionConfig,
    ) {
        config.minted = 0;
    }

    public fun update_display(
        _cap: &AdminCap,
        display: &mut sui::display::Display<CrusherNFT>,
    ) {
        display::add(display, string::utf8(b"rarity"), string::utf8(b"{rarity}"));
        display::add(display, string::utf8(b"crush_count"), string::utf8(b"{crush_count}"));
        display::add(display, string::utf8(b"serial"), string::utf8(b"{serial}"));
        display::update_version(display);
    }

    public fun init_display_v2(
        _cap: &AdminCap,
        publisher: &sui::package::Publisher,
        ctx: &mut TxContext,
    ) {
        let mut display = display::new<CrusherNFT>(publisher, ctx);
        display::add(&mut display, string::utf8(b"name"), string::utf8(b"{name}"));
        display::add(&mut display, string::utf8(b"description"), string::utf8(b"{description}"));
        display::add(&mut display, string::utf8(b"image_url"), string::utf8(b"{url}"));
        display::add(&mut display, string::utf8(b"rarity"), string::utf8(b"{rarity}"));
        display::add(&mut display, string::utf8(b"crush_count"), string::utf8(b"{crush_count}"));
        display::add(&mut display, string::utf8(b"serial"), string::utf8(b"{serial}"));
        display::update_version(&mut display);
        transfer::public_transfer(display, tx_context::sender(ctx));
    }

    // ── Read-only accessors ───────────────────────────────────────────
    public fun crush_count(nft: &CrusherNFT): u64 {
        nft.crush_count
    }

    public fun rarity(nft: &CrusherNFT): &String {
        &nft.rarity
    }

    public fun serial(nft: &CrusherNFT): u64 {
        nft.serial
    }

    public fun pool_balance(config: &CollectionConfig): u64 {
        balance::value(&config.pool)
    }
}
