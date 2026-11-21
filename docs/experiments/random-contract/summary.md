# Bounded PRNG contract parity proof

The fixture contract `draws(env, u32)` draws at most 4 u64 values from `env.prng()`. It was genuinely built, uploaded and deployed on a pinned protocol-28 standalone network, then invoked through the public `measureInvocation` path with raw IO observers attached.

- WASM SHA256: `6fe2e6ce6252d6d90ceb16edd4d3a7f19235e936cf1ec4b7abfc5432a91e782e`
- Runtime contract id: `CALYKFXT2HZMJHRRA5OBSKHZ4EN6MTMFGT3NY6PXMSZHEMSKUTIAQXMO`
- Native seed: 32 zero bytes (product default, unchanged)
- RPC seed: the network consensus seed; its observed values are genuine
- RPC PRNG values: `15764725445078934737`, `8969746457395304528`, `11711078206644928651`, `10746743389641306449`
- Native zero-seed values: `6775509081846337106`, `2134185115815765970`, `424782024986044791`, `8960188967690328188`
- Parity result: rejected, return-value only ({"transactionData":false,"returnValue":true,"contractEvents":false})
- Deterministic `constant()` control: accepted with the same fixed zero seed

Both sides produced nonzero, distinct PRNG values. The product seed was not changed to make the proof pass; the rejection is the expected result for a random-dependent invocation.
