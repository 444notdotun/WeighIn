# Temporary-entry TTL proof

A bounded contract wrote one temporary entry on a pinned protocol-28 standalone network. The live snapshot was captured through the public `measureInvocation` path with raw RPC and native IO observers attached.

- WASM SHA256: `135fc552c0337182c173d66876a0e5d0664970b8e593a70bb1b2d9079ade9498`
- Runtime contract id: `CBMRTOMHQFYQK2VQHGBEKOHDA5EM7GWYSYMBKHRHFP2L2XZ2D65IPUVA`
- Temporary write transaction: `615d2bfa3b8b2fe6f91e0af297be37f3d7746c28b9914ea77daf87d5262e3df9`
- Live header ledger: `2930`
- Genuine `liveUntilLedgerSeq`: `3649`
- Natural expiry observed absent at ledger: `3650`
- Archived control header ledger: `3650`

The live case was accepted by native replay. After the ledger advanced past the genuine `liveUntilLedgerSeq`, RPC returned no live entry; that observation is retained as the unavailable natural-rejection outcome. The defensive archived-entry rejection was exercised by pairing the unchanged live entry fields with a later genuine ledger header. No TTL or entry field was edited; only `header_xdr` was advanced from a raw `getLedgers` response, and the composed input is archived in full.

The native helper exited `1` with `archived ledger state is unsupported` for the composed expired input. A malformed-header control also exited nonzero, confirming the failure path is explicit rather than an invented measurement.
