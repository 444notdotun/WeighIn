const assert = require('node:assert/strict');
const { test } = require('node:test');
const { Address, Asset, Keypair, nativeToScVal } = require('@stellar/stellar-sdk');
const { bindAsset, policy, transferFixture } = require('./experiments/token-transfer-cases.cjs');
const { FixturesSpecSchema } = require('../dist/config');
const { toScVal } = require('../dist/measurement');
const { loadConfigContent } = require('../dist/threshold');

const network = 'Standalone Network ; February 2017';
const account = byte => Keypair.fromRawEd25519Seed(Buffer.alloc(32, byte)).publicKey();
const asset = new Asset('WEIGHIN', account(1)).contractId(network);
const address = Address.fromString(asset).toScVal();
const receipt = { status: 'SUCCESS', ledger: 42, returnValue: address };

test('transfer policy applies strict CPU tolerance to the measured function', () => {
  assert.equal(loadConfigContent(policy, 'policy.toml').thresholds.functions.transfer.cpu_instructions,
    'strict_zero_tolerance');
});

test('committed standard asset address and exact i128 amount reach the transfer fixture', () => {
  const bound = bindAsset(receipt, asset);
  const fixture = transferFixture('transfer.wasm', bound, account(2), account(3), '25000000');
  const [contract] = FixturesSpecSchema.parse(fixture).contracts;
  const [invocation] = contract.invocations;
  assert.equal(invocation.function_name, 'transfer');
  assert.deepEqual(invocation.args.map(arg => toScVal(arg).toXDR('base64')), [
    address,
    Address.fromString(account(2)).toScVal(),
    Address.fromString(account(3)).toScVal(),
    nativeToScVal(25000000n, { type: 'i128' }),
  ].map(value => value.toXDR('base64')));
});

test('asset binding fails closed for missing, uncommitted, malformed or unrelated receipts', () => {
  assert.throws(() => bindAsset({ ...receipt, status: 'FAILED' }, asset), /must be committed/);
  assert.throws(() => bindAsset({ ...receipt, ledger: 0 }, asset), /inclusion ledger/);
  assert.throws(() => bindAsset({ ...receipt, returnValue: undefined }, asset), /returned no value/);
  assert.throws(() => bindAsset({ ...receipt, returnValue: nativeToScVal(42) }, asset), /address/);
  const otherAsset = new Asset('OTHER', account(1)).contractId(network);
  assert.throws(() => bindAsset(receipt, otherAsset), /must match the configured asset/);
});
