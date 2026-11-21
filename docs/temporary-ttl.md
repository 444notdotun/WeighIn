# Temporary-entry TTL proof

This bounded proof records how a genuine temporary ledger entry behaves while
live, after natural expiry, and in the helper's defensive archived-state path on
a pinned protocol-28 standalone network. It does not add a restore operation or
general archived-state support.

## Result

| Observation | Recorded outcome |
|---|---|
| Live temporary entry, unmodified RPC snapshot | Accepted by `measureInvocation` and reproduced byte-for-byte by native replay |
| Natural expiry past the genuine `liveUntilLedgerSeq` | RPC returns no live entry (`entries: []`); no archived row is exposed |
| Archived-state control | Same entry fields, later genuine header: helper exits 1 with `archived ledger state is unsupported` |
| Malformed header control | Helper exits 1 with an explicit XDR error; no invented measurement |

The live measurement used ledger `2930` and a temporary entry with genuine
`liveUntilLedgerSeq` `3649` (`minTemporaryTtl = 720` on this network). The entry
was absent at ledger `3650`. The archived control advanced only `header_xdr` to
a raw `getLedgers` response at ledger `3650`; every entry and TTL field stayed
byte-identical to the accepted live snapshot.

WASM SHA256 was
`135fc552c0337182c173d66876a0e5d0664970b8e593a70bb1b2d9079ade9498` and the
runtime contract ID was
`CBMRTOMHQFYQK2VQHGBEKOHDA5EM7GWYSYMBKHRHFP2L2XZ2D65IPUVA`.

## Method

The [fixture](../tests/fixtures/temporary-ttl/contract/src/lib.rs) writes one
`temporary` `Symbol` entry with `env.storage().temporary().set` and reads it
back. The [harness](../tests/experiments/verify-temporary-ttl.cjs) builds and
deploys that fixture, submits the write, then calls `measureInvocation` with raw
RPC and native IO observers attached. It waits for the network to pass the
reported `liveUntilLedgerSeq` without editing any captured value.

Raw `getLedgerEntries` and `getLedgers` observations are archived in
[`ledger-observations.json`](experiments/temporary-ttl/ledger-observations.json).
[`composition.json`](experiments/temporary-ttl/composition.json) records the
field-level origin of the archived control: `header_xdr` comes from the later
RPC header, and all other native-input fields come from the accepted live
snapshot. No `live_until` or `liveUntilLedgerSeq` value was edited. The full
accepted, rejected and invalid native inputs, outputs, stderr and exit statuses
are in [`native-replays.json`](experiments/temporary-ttl/native-replays.json).

## Scope and unavailable outcomes

- Natural expiry removes the temporary entry from RPC live state; RPC did not
  return an expired row with a past `liveUntilLedgerSeq`. A genuine single-snapshot
  network proof of the helper's archived-entry rejection is therefore unavailable
  from this RPC API.
- The archived rejection is a defensive helper-path proof using genuine RPC
  fields from two ledgers. It is not a claim that RPC returned an archived row.
- This does not prove eviction scheduling, temporary-entry restoration, funded
  rent behavior, or support for arbitrary archived-state queries.
- A missing helper, RPC failure, or infrastructure error is not treated as an
  expected policy result; all three native outcomes retain explicit exits/errors.
- Results apply only to the recorded SDK/protocol/network/fixture combination.

## Verification

[`verification.json`](experiments/temporary-ttl/verification.json) and
[`sha256.json`](experiments/temporary-ttl/sha256.json) cover the archive.
`tests/temporary-ttl.test.cjs` checks the evidence integrity and the
no-mutation composition rules without requiring the native helper.
`tests/native/temporary-ttl.test.cjs` replays the archived live, expired and
invalid inputs against the built helper. Both test files are part of this change.

Reproduce the archive against a pinned protocol-28 standalone network at
`http://localhost:18000/rpc` with the native helper built:

```sh
node tests/experiments/verify-temporary-ttl.cjs
```
