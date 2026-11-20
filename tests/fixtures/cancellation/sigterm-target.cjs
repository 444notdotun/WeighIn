const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawn } = require("node:child_process");
const {
  createCancellationScope,
  registerOwnedTempPath,
  setActiveCancellationScope,
} = require("../../../dist/cancellation");

const [resultPath, readyPath] = process.argv.slice(2);
const events = [];
const ownedDir = fs.mkdtempSync(
  path.join(os.tmpdir(), "weighin-sigterm-owned-"),
);
fs.writeFileSync(path.join(ownedDir, "marker"), "owned");
const workspaceDir = fs.mkdtempSync(path.join(os.tmpdir(), "caller-workspace-"));
const workspaceFile = path.join(workspaceDir, "keep.txt");
fs.writeFileSync(workspaceFile, "caller");

const child = spawn(process.execPath, ["-e", "setInterval(()=>{},1000)"], {
  stdio: "ignore",
});
child.once("exit", () => events.push("child-exit"));

const scope = createCancellationScope({
  installSignalHandlers: true,
  setExitCodeOnCancel: true,
  signals: ["SIGTERM"],
});
setActiveCancellationScope(scope);
scope.registerChild(child);
registerOwnedTempPath(
  ownedDir,
  async () => {
    events.push("cleanup-start");
    await fs.promises.rm(ownedDir, { recursive: true, force: true });
    events.push("cleanup-done");
  },
  "owned SIGTERM proof directory",
);

fs.writeFileSync(readyPath, "ready");

const blocker = new Promise((_, reject) => {
  if (scope.signal.aborted) reject(scope.signal.reason);
  else
    scope.signal.addEventListener(
      "abort",
      () => reject(scope.signal.reason),
      { once: true },
    );
});

(async () => {
  let failure = null;
  try {
    await blocker;
  } catch (error) {
    failure = String(error && error.message ? error.message : error);
    await scope.shutdown();
  } finally {
    const result = {
      failure,
      aborted: scope.signal.aborted,
      events,
      childPid: child.pid,
      childKilled: child.exitCode !== null || child.signalCode !== null,
      ownedExists: fs.existsSync(ownedDir),
      workspaceFileExists: fs.existsSync(workspaceFile),
      workspaceContent: fs.existsSync(workspaceFile)
        ? fs.readFileSync(workspaceFile, "utf8")
        : null,
      exitCode: process.exitCode,
    };
    fs.writeFileSync(resultPath, JSON.stringify(result));
    scope.dispose();
    fs.rmSync(workspaceDir, { recursive: true, force: true });
  }
})();
