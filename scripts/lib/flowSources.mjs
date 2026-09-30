import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

export const SOURCE_URL = 'https://www.anshinmap.co.jp/';
export const FLOW_KINDS = ['emergency', 'medicine', 'hospital'];
export const dataDirectory = new URL('../../src/data/flows/', import.meta.url);
export const manifestUrl = new URL('../../src/data/source.json', import.meta.url);
export const sha256 = (text) => createHash('sha256').update(text).digest('hex');

export async function readSources() {
  const texts = Object.fromEntries(await Promise.all(FLOW_KINDS.map(async (kind) =>
    [kind, await readFile(new URL(`${kind}.json`, dataDirectory), 'utf8')])));
  return { texts, protocols: Object.fromEntries(Object.entries(texts).map(([kind, text]) => [kind, JSON.parse(text)])) };
}

export function createManifest(texts, protocols, verifiedAt = new Date().toISOString()) {
  return {
    site_url: SOURCE_URL,
    verified_at: verifiedAt,
    flows: Object.fromEntries(FLOW_KINDS.map((kind) => [kind, {
      url: new URL(`flows/${kind}.json`, SOURCE_URL).href,
      protocol_version: protocols[kind].protocol_version,
      sha256: sha256(texts[kind]),
      question_count: Object.keys(protocols[kind].questions).length,
      outcome_count: Object.keys(protocols[kind].outcomes).length,
    }])),
  };
}
