import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';

const API_BASE_URL = globalThis.process?.env?.API_BASE_URL || 'http://localhost:5000';
const STARTUP_TIMEOUT_MS = 30000;

async function isServerReady() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: '__probe__', password: '__probe__' })
    });

    // 401 means route is reachable, so server is up.
    return response.status === 401;
  } catch {
    return false;
  }
}

async function waitForServer() {
  const startedAt = Date.now();
  while (Date.now() - startedAt < STARTUP_TIMEOUT_MS) {
    if (await isServerReady()) return;
    await delay(500);
  }
  throw new Error(`Backend did not become ready within ${STARTUP_TIMEOUT_MS}ms`);
}

function runSmoke() {
  return new Promise((resolve, reject) => {
    const smoke = spawn('npm', ['run', 'smoke'], {
      stdio: 'inherit',
      shell: true
    });

    smoke.on('error', reject);
    smoke.on('exit', code => {
      if (code === 0) resolve();
      else reject(new Error(`Smoke test failed with exit code ${code}`));
    });
  });
}

async function main() {
  const backend = spawn('npm', ['run', 'dev:backend'], {
    stdio: 'inherit',
    shell: true
  });

  try {
    await waitForServer();
    await runSmoke();
  } finally {
    backend.kill('SIGTERM');
  }
}

main().catch(error => {
  console.error(error.message);
  globalThis.process?.exit(1);
});
