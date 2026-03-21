import { get } from '../httpClient';

/**
 * STATS SERVICE
 * ─────────────────────────────────────────────
 * GET /stats → { sounds, creators, streamers, paid }
 */

export async function getStats() {
  return get('/stats');
}
