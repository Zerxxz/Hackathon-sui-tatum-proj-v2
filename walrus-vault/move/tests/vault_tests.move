// Unit tests for the Capsule contract.
//
// Run with:  sui move test
//
// We exercise the four behaviours that matter:
//   1. create_capsule transfers the object to the recipient.
//   2. unlock_capsule fails before unlock_at_ms (abort 0 = ENotYetUnlocked).
//   3. unlock_capsule fails when the caller is not the recipient (abort 1).
//   4. unlock_capsule succeeds after unlock_at_ms and flips `unlocked`.

#[test_only]
module walrus_vault::vault_tests {
    use std::string;
    use sui::clock;
    use sui::test_scenario as ts;
    use walrus_vault::vault::{Self, Capsule};

    const ALICE: address = @0xA11CE;
    const BOB: address = @0xB0B;

    fun seed_capsule(scenario: &mut ts::Scenario, recipient: address, unlock_at_ms: u64) {
        ts::next_tx(scenario, ALICE);
        vault::create_capsule(
            recipient,
            string::utf8(b"blob_abc"),
            b"key-bytes",
            unlock_at_ms,
            string::utf8(b"Test capsule"),
            ts::ctx(scenario),
        );
    }

    #[test]
    fun create_transfers_to_recipient() {
        let mut scenario = ts::begin(ALICE);
        seed_capsule(&mut scenario, BOB, 1_000_000);

        ts::next_tx(&mut scenario, BOB);
        let cap = ts::take_from_sender<Capsule>(&scenario);
        assert!(vault::recipient(&cap) == BOB, 100);
        assert!(!vault::is_unlocked(&cap), 101);
        ts::return_to_sender(&scenario, cap);

        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = 0, location = walrus_vault::vault)]
    fun unlock_before_time_aborts() {
        let mut scenario = ts::begin(ALICE);
        seed_capsule(&mut scenario, BOB, 5_000); // far in the future

        ts::next_tx(&mut scenario, BOB);
        let mut cap = ts::take_from_sender<Capsule>(&scenario);
        let clock = clock::create_for_testing(ts::ctx(&mut scenario)); // t = 0
        vault::unlock_capsule(&mut cap, &clock, ts::ctx(&mut scenario));

        clock::destroy_for_testing(clock);
        ts::return_to_sender(&scenario, cap);
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = 1, location = walrus_vault::vault)]
    fun unlock_by_non_recipient_aborts() {
        let mut scenario = ts::begin(ALICE);
        seed_capsule(&mut scenario, BOB, 0);

        // Alice (the creator) tries to unlock Bob's capsule.
        ts::next_tx(&mut scenario, ALICE);
        let mut cap = ts::take_from_address<Capsule>(&scenario, BOB);
        let clock = clock::create_for_testing(ts::ctx(&mut scenario));
        vault::unlock_capsule(&mut cap, &clock, ts::ctx(&mut scenario));

        clock::destroy_for_testing(clock);
        ts::return_to_address(BOB, cap);
        ts::end(scenario);
    }

    #[test]
    fun unlock_after_time_succeeds() {
        let mut scenario = ts::begin(ALICE);
        seed_capsule(&mut scenario, BOB, 0);

        ts::next_tx(&mut scenario, BOB);
        let mut cap = ts::take_from_sender<Capsule>(&scenario);
        let mut clock = clock::create_for_testing(ts::ctx(&mut scenario));
        clock::set_for_testing(&mut clock, 10);
        vault::unlock_capsule(&mut cap, &clock, ts::ctx(&mut scenario));

        assert!(vault::is_unlocked(&cap), 200);

        clock::destroy_for_testing(clock);
        ts::return_to_sender(&scenario, cap);
        ts::end(scenario);
    }
}
