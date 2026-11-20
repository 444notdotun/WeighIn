# Funded standard token transfer

The benchmark calls the standard `transfer(from, to, amount)` interface of a
Stellar Asset Contract for a local credit asset. The experiment uses protocol
28, the WeighIn measurement pipeline, and the native replay helper.

The setup script funds three disposable Stellar accounts on a fresh standalone
network. The sender and recipient sign their trustline transactions. The issuer
commits payments of 100 and 10 WEIGHIN to those accounts, then deploys the
asset contract. The script verifies the included create receipt and binds its
typed address to the fixture after comparing it with the address derived from
the asset and network. It reads both balances before benchmarking. Token
balances and transfer amounts use seven decimal places.

Every measurement uses the same funded sender as the transaction source.
The client requires that sender's authorization at the root invocation,
allowing recording-mode simulation to attach the nested token transfer.
Baseline and control use the same transfer-client WASM. The regression
variant adds twelve redundant balance calls before the same transfer. The
zero-tolerance CPU policy uses the same fixture, contract, and case IDs across
the comparisons. It accepts the control and rejects the injected CPU
regression. An overdraw must fail with a token contract error, and an unfunded
source account must fail before simulating a transfer.

The harness also executes the shipped Action bundle against a temporary Git
history with the same funded fixture. A preload supplies the funded sender to
the Action's temporary key directory and records RPC and helper traffic.
The archive retains the bundle's process exits, reports and diffs for both
comparisons.

Measurement records recording-mode authorization and discards simulated
writes. The experiment separately checks the sender's source-account
authorization entry and signs and submits one real transfer. It checks that
the two balances stay at 100 and 10 WEIGHIN through measurement and become
97.5 and 12.5 WEIGHIN after the signed transaction is included.

## Replay

Use a fresh disposable standalone network started with
[the pinned local network script](../scripts/start-local-network.sh). The
fixture keys are deterministic and public. Use them only on the disposable
network. The experiment performs asset issuance and authorization setup in
its harness. The generic fixture invokes the transfer client with the
receipt-bound asset address. The scenario covers this transfer and its
required ledger state. External escrow and upstream adoption remain outside
its scope.

```sh
npm ci
npm run build
npm run build:helper
stellar contract build --locked --optimize=true \
  --manifest-path tests/fixtures/token-transfer/Cargo.toml --out-dir tests/fixtures/token-transfer/target/control-wasm
stellar contract build --locked --optimize=true --features redundant-balance-reads \
  --manifest-path tests/fixtures/token-transfer/Cargo.toml --out-dir tests/fixtures/token-transfer/target/regression-wasm
WEIGHIN_EXPERIMENT_RPC_URL=http://localhost:8000/rpc \
WEIGHIN_EXPERIMENT_IMAGE="$(docker inspect --format '{{.Config.Image}}' stellar-quickstart)" \
node tests/experiments/verify-token-transfer.cjs token-transfer-capture \
  native/simulation/target/x86_64-unknown-linux-gnu/release/weighin-simulation \
  tests/fixtures/token-transfer/target/control-wasm/contract_test.wasm \
  tests/fixtures/token-transfer/target/regression-wasm/contract_test.wasm
```

The output directory contains transaction receipts, raw RPC and native
replays, exact fixtures and artifacts, records, policy results, and SHA-256
checksums. A failed prerequisite or replay exits nonzero and cannot count
as a policy rejection.

The [Windows attempt](experiments/token-transfer-windows-attempt/verification.json)
reached committed setup and stopped at the Linux x64 measurement guard.
The [first hosted attempt](experiments/token-transfer-auth-attempt/verification.json)
reached the token call and exposed the root authorization requirement.
