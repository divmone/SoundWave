/**
 * STATS API
 *
 * ═══════════════════════════════════════════════════════
 *  GET /api/stats
 *  → {
 *      sounds: string      // "12K+"
 *      creators: string    // "3.5K+"
 *      streamers: string   // "45K+"
 *      paid: string        // "$250K"
 *    }
 * ═══════════════════════════════════════════════════════
 */

import { request } from './config';
import { MOCK_STATS } from './mock';

const USE_MOCK = process.env.REACT_APP_USE_MOCK !== 'false';

export async function getStats() {
  if (USE_MOCK) {
    await new Promise(r => setTimeout(r, 150));
    return MOCK_STATS;
  }
  return request('/stats');
}
