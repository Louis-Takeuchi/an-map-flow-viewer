import { readFile } from 'node:fs/promises';
import { isDeepStrictEqual } from 'node:util';
import { validateProtocols, normalizeFlows } from '../src/lib/flowModel.js';
import { readSources, createManifest, manifestUrl } from './lib/flowSources.mjs';

try {
  const { texts, protocols } = await readSources();
  const errors = validateProtocols(protocols);
  if (errors.length) throw new Error(errors.join('\n'));
  const manifest = JSON.parse(await readFile(manifestUrl, 'utf8'));
  if (!Number.isFinite(Date.parse(manifest.verified_at))) throw new Error('Invalid source verification date.');
  const expected = createManifest(texts, protocols, manifest.verified_at);
  if (!isDeepStrictEqual(manifest, expected)) throw new Error('Source metadata/hash differs from saved protocols. Run npm run sync:flows.');
  const data = normalizeFlows(protocols);
  console.log('Flow validation passed.');
  console.log(`- Question nodes: ${data.nodes.length}`);
  console.log(`- Outcome nodes: ${Object.keys(data.outcomes).length}`);
  for (const [kind, flow] of Object.entries(protocols)) {
    console.log(`- ${kind}: ${Object.keys(flow.questions).length} questions, ${Object.keys(flow.outcomes).length} outcomes (${flow.protocol_version})`);
  }
  console.log('- Duplicate IDs / missing references / unreachable nodes / cycles: 0');
  console.log('- Source URLs, versions, counts and SHA-256 hashes verified.');
} catch (error) {
  console.error(`Flow validation failed:\n${error.message}`);
  process.exitCode = 1;
}
