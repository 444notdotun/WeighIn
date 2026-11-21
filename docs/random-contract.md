# Bounded random-contract parity proof

This document and the archived evidence in
[`docs/experiments/random-contract`](experiments/random-contract/) show the
observed behavior of a PRNG-dependent Soroban invocation under WeighIn's
recording-mode native replay. The conclusion is deliberately narrow: the fixed
native seed and the RPC/native parity gate reject this random-dependent case
instead of blending or substituting resources. It does not claim signed
production authorization, broad RPC support or deterministic randomness.

## What the fixture does

The proof contract in
[`tests/fixtures/random-contract`](../tests/fixtures/random-contract/) exposes
two functions:

```rust
pub fn draws(env: Env, count: u32) -> Vec<u64> {
    let mut prng = env.prng();
    let bounded = if count > 4 { 4 } else { count };
    let mut out = vec![&env];
    let mut index = 0u32;
    while index < bounded {
        out.push_back(prng.gen::<u64>());
        index += 1;
    }
    out
}

pub fn constant(_env: Env) -> Symbol {
    symbol_short!("fixed")
}
```

`draws` is bounded to at most four `u64` draws so the case stays finite, but
every returned value comes from the host PRNG. `constant` is the deterministic
control in the same compiled contract: it exercises the same build, deployment,
account and snapshot path without a PRNG dependency.

## What was run

The harness
[`tests/experiments/verify-random-contract.cjs`](../tests/experiments/verify-random-contract.cjs)
performed the real steps and only observed IO:

1. Built the fixture with the pinned Stellar CLI 28.0.0, Rust 1.95.0 and
   Soroban SDK 28.0.0 (`--locked --optimize=true`, `wasm32v1-none`).
2. Funded a fresh deployer through Friendbot and committed a genuine WASM
   upload and contract creation on the pinned protocol-28 standalone network.
3. Constructed one `invokeHostFunction` transaction for `draws(4)` and one for
   `constant()`, then called the public `measureInvocation` path against the
   real RPC endpoint and the real native helper.
4. Attached byte-for-byte observers to `fetch` and `execFile`; no simulated or
   RPC value was replaced by the harness.

The [environment record](experiments/random-contract/environment.json) retains
the exact digest, endpoint, passphrase, runtime contract id, helper hash,
toolchain and source revision. The [checksum manifest](experiments/random-contract/sha256.json)
covers every retained file, including the [raw RPC](experiments/random-contract/rpc-captures.json)
and [native replays](experiments/random-contract/native-replays.json).

## Result

| Case | Native seed | Native return | RPC return | Outcome |
|---|---|---|---|---|
| `draws(4)` | `[0; 32]` (product default) | `[6775509081846337106, 2134185115815765970, 424782024986044791, 8960188967690328188]` | `[15764725445078934737, 8969746457395304528, 11711078206644928651, 10746743389641306449]` | **rejected** |
| `constant()` | `[0; 32]` | `Symbol("fixed")` | `Symbol("fixed")` | accepted |

Both sides produced genuine nonzero PRNG values, and the two lists are
different. The rejection is return-value only:

```json
{
  "transactionData": false,
  "returnValue": true,
  "contractEvents": false
}
```

The captured transaction data, footprint and charged events agree; only the
returned PRNG values disagree. `measureInvocation` fails with
`auth/random/state-dependent invocation is unsupported` rather than reporting a
benchmark. [The verification record](experiments/random-contract/verification.json)
retains the exact error, parity flags, both value lists and the accepted
control.

The fixed seed was **not** changed to make the proof green. It is the product
default recorded in every native replay input, and the helper's malformed-seed
guard still fails explicitly. The deterministic control shows that matching is
still possible, and is only accepted when the return genuinely agrees; the gate
does not reject the contract merely for using PRNG source text.

## Reproduction and boundaries

```bash
npm ci
npm run build
npm run build:helper
bash scripts/start-local-network.sh   # pinned protocol-28 image, port 8000
WEIGHIN_EXPERIMENT_RPC_URL=http://localhost:8000/rpc \
  node tests/experiments/verify-random-contract.cjs /tmp/weighin-random-proof
node --test tests/random-contract.test.cjs
npm run test:native                   # includes the real-helper replay test
```

The harness exits zero only after observing the expected rejection, the
justified matching control, distinct genuine nonzero values and complete raw
captures. Infrastructure failures are never counted as proof.

This is one contract, one protocol-28 standalone network, one fixed seed and
one bounded draw count. It does not prove signed authorization, arbitrary
PRNG-dependent contracts, cross-machine determinism or a general RPC seed
derivation formula. Ledger-dependent variation is a separate concern covered by
the [ledger-variation proof](ledger-variation.md).
