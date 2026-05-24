// =====================================================================
// Walrus Vault - Time-Locked Capsule
// =====================================================================
// A capsule stores a reference to an encrypted blob on Walrus together
// with the metadata required to reveal it after a specific point in time.
//
// MVP design notes:
//   - The actual file payload lives on Walrus (not on Sui), referenced
//     by a `blob_id` string.
//   - The AES key for the payload is held in `encrypted_key`. In the MVP
//     this field is encrypted to the recipient's wallet pubkey client-side
//     (ECIES-style). v2 will swap this for Seal so the time-lock is also
//     cryptographic, not just enforced by the contract + UI.
//   - `unlock_capsule` is the on-chain gate: it enforces both the unlock
//     time and the recipient identity, then emits an event the frontend
//     can listen to.
// =====================================================================

module walrus_vault::vault {
    use std::string::String;
    use sui::clock::{Self, Clock};
    use sui::event;

    // ---- Error codes ---------------------------------------------------

    const ENotYetUnlocked: u64 = 0;
    const ENotRecipient: u64 = 1;
    const EAlreadyUnlocked: u64 = 2;

    // ---- Object --------------------------------------------------------

    /// A single time-locked capsule. Owned by the recipient so it shows up
    /// in their wallet automatically.
    public struct Capsule has key, store {
        id: UID,
        creator: address,
        recipient: address,
        /// Walrus blob id (base64url string) that holds the encrypted payload.
        blob_id: String,
        /// AES key for the payload, encrypted to the recipient's pubkey.
        encrypted_key: vector<u8>,
        /// Unix milliseconds. Capsule cannot be unlocked before this time.
        unlock_at_ms: u64,
        /// Human-readable label shown in the UI.
        title: String,
        /// True once `unlock_capsule` has been called successfully.
        unlocked: bool,
    }

    // ---- Events --------------------------------------------------------

    public struct CapsuleCreated has copy, drop {
        capsule_id: ID,
        creator: address,
        recipient: address,
        unlock_at_ms: u64,
    }

    public struct CapsuleUnlocked has copy, drop {
        capsule_id: ID,
        recipient: address,
        unlocked_at_ms: u64,
    }

    // ---- Entry functions -----------------------------------------------

    /// Create a new capsule and transfer it to the recipient.
    /// For self-capsules (letter to future self), pass your own address as
    /// `recipient`.
    public entry fun create_capsule(
        recipient: address,
        blob_id: String,
        encrypted_key: vector<u8>,
        unlock_at_ms: u64,
        title: String,
        ctx: &mut TxContext,
    ) {
        let capsule = Capsule {
            id: object::new(ctx),
            creator: ctx.sender(),
            recipient,
            blob_id,
            encrypted_key,
            unlock_at_ms,
            title,
            unlocked: false,
        };

        event::emit(CapsuleCreated {
            capsule_id: object::id(&capsule),
            creator: ctx.sender(),
            recipient,
            unlock_at_ms,
        });

        transfer::public_transfer(capsule, recipient);
    }

    /// Mark the capsule as unlocked. Only the recipient may call, and only
    /// once `clock` has passed `unlock_at_ms`.
    public entry fun unlock_capsule(
        capsule: &mut Capsule,
        clock: &Clock,
        ctx: &TxContext,
    ) {
        assert!(ctx.sender() == capsule.recipient, ENotRecipient);
        assert!(!capsule.unlocked, EAlreadyUnlocked);
        let now = clock::timestamp_ms(clock);
        assert!(now >= capsule.unlock_at_ms, ENotYetUnlocked);

        capsule.unlocked = true;

        event::emit(CapsuleUnlocked {
            capsule_id: object::id(capsule),
            recipient: capsule.recipient,
            unlocked_at_ms: now,
        });
    }

    // ---- Read accessors (used by the frontend via getObject) ----------

    public fun blob_id(c: &Capsule): &String { &c.blob_id }
    public fun encrypted_key(c: &Capsule): &vector<u8> { &c.encrypted_key }
    public fun unlock_at_ms(c: &Capsule): u64 { c.unlock_at_ms }
    public fun title(c: &Capsule): &String { &c.title }
    public fun is_unlocked(c: &Capsule): bool { c.unlocked }
    public fun creator(c: &Capsule): address { c.creator }
    public fun recipient(c: &Capsule): address { c.recipient }
}
