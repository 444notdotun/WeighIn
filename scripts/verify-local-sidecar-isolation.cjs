// Run on a Linux Docker host after npm ci and npm run build.
const assert = require("node:assert/strict");
const { execFile } = require("node:child_process");
const { randomUUID } = require("node:crypto");
const fs = require("node:fs");
const os = require("node:os");
const { Address, xdr } = require("@stellar/stellar-sdk");

const output = process.argv[2];
if (!output)
  throw new Error(
    "Usage: node scripts/verify-local-sidecar-isolation.cjs OUTPUT.json",
  );

function run(command, args) {
  return new Promise((resolve) => {
    execFile(command, args, (error, stdout, stderr) => {
      resolve({
        command,
        args,
        exit: error?.code ?? (error ? null : 0),
        signal: error?.signal ?? null,
        stdout,
        stderr,
      });
    });
  });
}

function requireSuccess(result) {
  assert.equal(result.exit, 0, result.stdout + result.stderr);
  return result.stdout;
}

async function rpc(captures, url, method, params) {
  const request = { jsonrpc: "2.0", id: 1, method, params };
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
    signal: AbortSignal.timeout(5000),
  });
  const body = await response.text();
  captures.push({ url, request, status: response.status, body });
  assert.ok(response.ok, body);
  const json = JSON.parse(body);
  assert.ok(json.result, body);
  return json.result;
}

async function main() {
  const suffix = randomUUID().slice(0, 8);
  const sidecars = [18080, 18081].map((port) => ({
    name: `weighin-isolation-${suffix}-${port}`,
    port,
    url: `http://localhost:${port}/rpc`,
  }));
  const evidence = {
    node: process.version,
    platform: os.platform(),
    architecture: os.arch(),
    kernel: os.release(),
    revision: await run("git", ["rev-parse", "HEAD"]),
    docker: await run("docker", ["version"]),
    sidecars,
    rpc: [],
  };

  try {
    await Promise.all(
      sidecars.map(async (sidecar) => {
        sidecar.start = await run("bash", [
          "scripts/start-local-network.sh",
          "--name",
          sidecar.name,
          "--port",
          String(sidecar.port),
        ]);
      }),
    );
    for (const sidecar of sidecars) {
      const stdout = requireSuccess(sidecar.start);
      assert.ok(stdout.includes(`RPC reads at ${sidecar.url}`), stdout);
      sidecar.account = stdout.match(
        /Deployer account confirmed in RPC: (G[A-Z2-7]{55})/,
      )?.[1];
      assert.ok(sidecar.account, stdout);
      const ledger = await rpc(
        evidence.rpc,
        sidecar.url,
        "getLatestLedger",
        {},
      );
      assert.equal(String(ledger.protocolVersion), "28");
    }
    assert.notEqual(sidecars[0].account, sidecars[1].account);
    const keys = sidecars.map(({ account }) =>
      xdr.LedgerKey.account(
        new xdr.LedgerKeyAccount({
          accountId: Address.fromString(account).toScAddress().accountId(),
        }),
      ).toXDR("base64"),
    );
    for (const [index, sidecar] of sidecars.entries()) {
      const result = await rpc(evidence.rpc, sidecar.url, "getLedgerEntries", {
        keys,
      });
      assert.deepEqual(
        result.entries.map(({ key }) => key),
        [keys[index]],
      );
    }
    evidence.isolated = true;
  } catch (error) {
    evidence.failure = error.message;
    throw error;
  } finally {
    for (const sidecar of sidecars) {
      sidecar.lookup = await run("docker", [
        "ps",
        "-q",
        "--no-trunc",
        "--filter",
        `name=^/${sidecar.name}$`,
        "--filter",
        "label=io.weighin.managed-by=weighin-start-local-network",
      ]);
      const id = sidecar.lookup.stdout.trim();
      if (sidecar.lookup.exit === 0 && /^[0-9a-f]{64}$/.test(id)) {
        sidecar.id = id;
        sidecar.inspect = await run("docker", [
          "inspect",
          "--format",
          "{{.Id}} {{.Image}} {{json .NetworkSettings.Ports}}",
          id,
        ]);
        sidecar.stop = await run("docker", ["stop", id]);
      }
    }
    fs.writeFileSync(output, JSON.stringify(evidence, null, 2) + "\n");
  }
  assert.ok(
    sidecars.every(({ id }) => id),
    "Both managed container IDs must be recorded",
  );
  assert.notEqual(sidecars[0].id, sidecars[1].id);
  for (const sidecar of sidecars) {
    const inspect = requireSuccess(sidecar.inspect);
    assert.ok(inspect.includes(`"HostPort":"${sidecar.port}"`), inspect);
    requireSuccess(sidecar.stop);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
