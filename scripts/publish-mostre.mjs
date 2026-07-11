// Publishes public/mostre.json to the main branch on GitHub (the Pages
// workflow then deploys it). Used by the /update-mostre skill so we don't
// depend on `git push`, which is sandboxed in the Claude Code environment.
//
// Usage: node scripts/publish-mostre.mjs "commit message"
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const OWNER = 'frafenaroli';
const REPO = 'mostraMI';
const BRANCH = 'main';
const FILE = 'public/mostre.json';

const message = process.argv[2] || `Refresh mostre.json (${new Date().toISOString().slice(0, 10)})`;
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const token = execSync('gh auth token').toString().trim();

async function gh(method, path, body) {
  const res = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`${method} ${path} -> ${res.status}: ${await res.text()}`);
  return res.json();
}

const baseRef = await gh('GET', `/git/ref/heads/${BRANCH}`);
const baseSha = baseRef.object.sha;
const baseCommit = await gh('GET', `/git/commits/${baseSha}`);

const blob = await gh('POST', '/git/blobs', {
  content: readFileSync(join(ROOT, FILE), 'utf8'),
  encoding: 'utf-8',
});
const tree = await gh('POST', '/git/trees', {
  base_tree: baseCommit.tree.sha,
  tree: [{ path: FILE, mode: '100644', type: 'blob', sha: blob.sha }],
});
const commit = await gh('POST', '/git/commits', {
  message,
  tree: tree.sha,
  parents: [baseSha],
});
await gh('PATCH', `/git/refs/heads/${BRANCH}`, { sha: commit.sha, force: false });

console.log(`Published ${FILE} — commit ${commit.sha.slice(0, 7)}. GitHub Pages will deploy it shortly.`);
