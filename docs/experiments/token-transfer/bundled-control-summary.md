## 🟢 WeighIn Benchmark Report

Policy source: **head** `policy.toml` at `82e463126ca6ab37c0382af6ed3b0f330cf8d545`; content SHA256 `2a9988f3ab1c8b1a63667904677a78238cdf7597c8f1d83c2f562a45d00d2ffc`.

<details><summary>Effective Policy Rules</summary>

| Target | Metric | Effective Rule | Source |
| :--- | :--- | :--- | :--- |
| `transfer` | CPU Instructions | `strict_zero_tolerance` | function_override |

</details>

**All thresholds passed** — comparing `main` → `82e46312`

### Contract `id:standard-token / id:transfer-client`

Runtime addresses: BASE `CCGKQ3MHRGHQRMAAXH3SBMF5SNSXUHQK2G4ZOAPP6CFJWYRWTNFZEQO5` → HEAD `CCGKQ3MHRGHQRMAAXH3SBMF5SNSXUHQK2G4ZOAPP6CFJWYRWTNFZEQO5`

#### `transfer / id:funded-transfer`

Compute source: soroban-simulation 28.0.1; protocol 28.

| | Metric | Base | Head | Delta | Change | Limit |
|---|---|---|---|---|---|---|
| ⚪ | CPU Instructions | 514,804 | 514,804 | ±0 | — | 400,000,000 |
| ⚪ | Memory Bytes | 1,216,032 | 1,216,032 | ±0 | — | 41,943,040 |
| ⚪ | Footprint Entries (RO + RW) | 5 | 5 | ±0 | — | 400 |
| ⚪ | Disk Read Bytes | 248 | 248 | ±0 | — | 200,000 |
| ⚪ | Write Footprint Entries | 2 | 2 | ±0 | — | 200 |
| ⚪ | Ledger Write Bytes | 248 | 248 | ±0 | — | 132,096 |
| ⚪ | Historical Read Bytes | Unavailable | Unavailable | Unavailable | — | Unavailable |
| ⚪ | Contract Data (instance) | Unavailable | Unavailable | Unavailable | — | Unavailable |
| ⚪ | Tx Size Bytes | Unavailable | Unavailable | Unavailable | — | Unavailable |
| ⚪ | Successful Contract/System Events | 1 | 1 | ±0 | — | No independent limit |
| ⚪ | Events + Return XDR Bytes | 252 | 252 | ±0 | — | 16,384 |

- **Historical Read Bytes unavailable**: BASE: Protocol 28 exposes historical-data fees, not a historical read consumption resource; HEAD: Protocol 28 exposes historical-data fees, not a historical read consumption resource
- **Contract Data (instance) unavailable**: BASE: No verified instance-only post-invocation size and corresponding limit mapping; HEAD: No verified instance-only post-invocation size and corresponding limit mapping
- **Tx Size Bytes unavailable**: BASE: Simulation estimates a maximum envelope; no signed benchmark transaction is submitted; HEAD: Simulation estimates a maximum envelope; no signed benchmark transaction is submitted

<details><summary>Snapshot and metric provenance</summary>

Snapshot ledgers: BASE 116 → HEAD 116.
Compute config SHA256: BASE `5e0aaa432815c17b201e2eeb5591a85e2355d758dc9a3989e58d7319096cf6b5` → HEAD `5e0aaa432815c17b201e2eeb5591a85e2355d758dc9a3989e58d7319096cf6b5`.
Full config SHA256: BASE `4af6be894ce5894a3623c207f9e4a68e666c6cea8265bbc3a849fe391ffe9493` → HEAD `4af6be894ce5894a3623c207f9e4a68e666c6cea8265bbc3a849fe391ffe9493`.
Resource limits SHA256: BASE `bd6ad7c9ae2afffe53a3d12e11fd45f0d74cd49b40be76a1ed10ace6b0f215a9` → HEAD `bd6ad7c9ae2afffe53a3d12e11fd45f0d74cd49b40be76a1ed10ace6b0f215a9`.
Helper SHA256: BASE `7642e4f174cf1e86e35938f11258bfe53f02db90aacfa1c880d71318e7054c03` → HEAD `7642e4f174cf1e86e35938f11258bfe53f02db90aacfa1c880d71318e7054c03`.
- **CPU Instructions** source: `soroban-simulation.simulated_instructions`; limit: `ConfigSettingContractComputeV0.txMaxInstructions`.
- **Memory Bytes** source: `soroban-simulation.simulated_memory`; limit: `ConfigSettingContractComputeV0.txMemoryLimit`.
- **Footprint Entries (RO + RW)** source: `SorobanResources.footprint.readOnly.length + readWrite.length`; limit: `ConfigSettingContractLedgerCostExtV0.txMaxFootprintEntries`.
- **Disk Read Bytes** source: `SorobanResources.diskReadBytes (identity adjustment)`; limit: `ConfigSettingContractLedgerCostV0.txMaxDiskReadBytes`.
- **Write Footprint Entries** source: `SorobanResources.footprint.readWrite.length`; limit: `ConfigSettingContractLedgerCostV0.txMaxWriteLedgerEntries`.
- **Ledger Write Bytes** source: `SorobanResources.writeBytes (identity adjustment)`; limit: `ConfigSettingContractLedgerCostV0.txMaxWriteBytes`.
- **Successful Contract/System Events** source: `successful non-diagnostic ContractEvents.length`; limit: Protocol 28 has no independent event-count cap.
- **Events + Return XDR Bytes** source: `sum(successful non-diagnostic ContractEvent XDR bytes) + return ScVal XDR bytes`; limit: `ConfigSettingContractEventsV0.txMaxContractEventsSizeBytes`.

</details>

---

<details><summary>Known measurement gaps</summary>

- **Unavailable metrics** are shown explicitly; configured policies requiring them fail.
- **Compute** uses protocol-matched native simulation and captured network cost settings.
- **WASM build determinism**: cross-CI-run hash equality has not yet been verified
  in two separate GitHub Actions runs. Snapshot repeatability does not prove build repeatability.

</details>

<!-- weighin-report -->