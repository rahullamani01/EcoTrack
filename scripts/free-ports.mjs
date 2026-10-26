// Frees the dev server ports before `npm run dev` starts.
// Only stops processes that look like this project's dev server, so unrelated
// apps on the same ports are reported instead of killed.
import { execSync } from 'node:child_process';

const PORTS = [3000, 24678];
const OURS = /server\.ts|tsx|vite|npm run dev/;

function listeningPids(port) {
  try {
    const out = execSync(`lsof -ti tcp:${port} -sTCP:LISTEN`, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    return out.trim().split(/\s+/).filter(Boolean).map(Number);
  } catch {
    return [];
  }
}

function commandOf(pid) {
  try {
    return execSync(`ps -p ${pid} -o command=`, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return '';
  }
}

const pids = new Set(PORTS.flatMap(listeningPids));
if (pids.size === 0) process.exit(0);

const ours = [];
for (const pid of pids) {
  const cmd = commandOf(pid);
  if (OURS.test(cmd)) {
    ours.push(pid);
  } else {
    console.warn(`[dev] Port is held by an unrelated process (pid ${pid}): ${cmd}`);
    console.warn('[dev] Stop it manually if the server fails to start.');
  }
}

for (const pid of ours) {
  try {
    process.kill(pid, 'SIGTERM');
    console.log(`[dev] Stopped stale dev server (pid ${pid})`);
  } catch {
    // Already gone.
  }
}

// Give them a moment to exit, then force anything still holding a port.
const deadline = Date.now() + 3000;
while (Date.now() < deadline && PORTS.some((p) => listeningPids(p).length > 0)) {
  execSync('sleep 0.2');
}

for (const port of PORTS) {
  for (const pid of listeningPids(port)) {
    if (ours.includes(pid)) {
      try {
        process.kill(pid, 'SIGKILL');
        console.log(`[dev] Force-stopped pid ${pid} on port ${port}`);
      } catch {
        // Already gone.
      }
    }
  }
}
