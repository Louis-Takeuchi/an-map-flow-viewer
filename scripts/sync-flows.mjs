import { writeFile } from 'node:fs/promises';
import { isDeepStrictEqual } from 'node:util';
import { validateProtocols } from '../src/lib/flowModel.js';
import { SOURCE_URL, FLOW_KINDS, dataDirectory, manifestUrl, readSources, createManifest } from './lib/flowSources.mjs';

const mode = process.argv[2];
if (!['--check', '--write'].includes(mode)) {
  console.error('Usage: node scripts/sync-flows.mjs --check | --write');
  process.exit(1);
}

try {
  // Fetch and validate all three files before changing the saved snapshot.
  const texts = Object.fromEntries(await Promise.all(FLOW_KINDS.map(async (kind) => {
    const url = new URL(`flows/${kind}.json`, SOURCE_URL);
    const response = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(20000) });
    if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
    return [kind, await response.text()];
  })));
  const protocols = Object.fromEntries(Object.entries(texts).map(([kind, text]) => [kind, JSON.parse(text)]));
  const errors = validateProtocols(protocols);
  if (errors.length) throw new Error(errors.join('\n'));

  if (mode === '--check') {
    const local = await readSources();
    const changed = FLOW_KINDS.filter((kind) => !isDeepStrictEqual(local.protocols[kind], protocols[kind]));
    if (changed.length) {
      console.error(`Published flow data differs: ${changed.join(', ')}. Run npm run sync:flows to update.`);
      process.exitCode = 1;
    } else {
      console.log('All 3 saved flow protocols match the published site.');
    }
  } else {
    for (const kind of FLOW_KINDS) await writeFile(new URL(`${kind}.json`, dataDirectory), texts[kind]);
    await writeFile(manifestUrl, JSON.stringify(createManifest(texts, protocols), null, 2) + '\n');
    console.log('Updated all 3 flow snapshots and source verification metadata.');
  }
} catch (error) {
  console.error(`Flow synchronization failed: ${error.message}`);
  process.exitCode = 1;
}
