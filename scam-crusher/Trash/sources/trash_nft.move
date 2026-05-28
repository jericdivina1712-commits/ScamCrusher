module trash_nft::trash_nft {
    use std::string::{Self, String};
    use sui::object::{Self, UID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use sui::event;

    // ── NFT Struct ──────────────────────────────────────────────────────────
    public struct TrashNFT has key, store {
        id: UID,
        name: String,
        rarity: String,
        image_url: String,
    }

    // ── Event ───────────────────────────────────────────────────────────────
    public struct MintEvent has copy, drop {
        nft_id: address,
        recipient: address,
        rarity: String,
    }

    // ── Mint ────────────────────────────────────────────────────────────────
    public entry fun mint(rarity: String, ctx: &mut TxContext) {
        let image_url = get_image(&rarity);
        let name = get_name(&rarity);

        let nft = TrashNFT {
            id: object::new(ctx),
            name,
            rarity: rarity,
            image_url,
        };

        event::emit(MintEvent {
            nft_id: object::uid_to_address(&nft.id),
            recipient: tx_context::sender(ctx),
            rarity: nft.rarity,
        });

        transfer::transfer(nft, tx_context::sender(ctx));
    }

    // ── Image URLs ──────────────────────────────────────────────────────────
    fun get_image(rarity: &String): String {
        let r = string::bytes(rarity);
        if (r == b"COMMON") {
            // Toxic Trash
            string::utf8(b"https://i.imgur.com/pkrU4nC.png")
        } else if (r == b"RARE") {
            // Rotten Trash
            string::utf8(b"https://i.imgur.com/Qpjjl91.png")
        } else if (r == b"EPIC") {
            // Poison Trash
            string::utf8(b"https://i.imgur.com/uewvZoX.png")
        } else {
            // LEGEND — Mountain Trash
            string::utf8(b"https://i.imgur.com/XN11Uv6.png")
        }
    }

    // ── Names ───────────────────────────────────────────────────────────────
    fun get_name(rarity: &String): String {
        let r = string::bytes(rarity);
        if (r == b"COMMON") {
            string::utf8(b"Toxic Trash")
        } else if (r == b"RARE") {
            string::utf8(b"Rotten Trash")
        } else if (r == b"EPIC") {
            string::utf8(b"Poison Trash")
        } else {
            string::utf8(b"Mountain Trash")
        }
    }
}