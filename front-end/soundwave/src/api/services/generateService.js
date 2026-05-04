import { getToken } from '../httpClient';

const BASE = '/generate';

async function call(method, path, body) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(path, {
    method,
    headers,
    ...(body !== undefined && { body: JSON.stringify(body) }),
  });

  const text = await res.text();
  if (!res.ok) {
    const err = new Error(text || `HTTP ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return text.trim();
}

export async function startGeneration(prompt) {
  const text = await call('POST', BASE, { prompt });
  try {
    const parsed = JSON.parse(text);
    return parsed.taskId ?? parsed.id ?? text;
  } catch {
    return text;
  }
}

export async function getTaskStatus(taskId) {
  return call('GET', `${BASE}/task/status/${encodeURIComponent(taskId)}`);
}

export async function addGeneratedSound(taskId) {
  return call('POST', `${BASE}/add/${encodeURIComponent(taskId)}`);
}

export async function getGenerationInfo(soundId) {
  const text = await call('GET', `${BASE}/info/${encodeURIComponent(soundId)}`);
  try { return JSON.parse(text); }
  catch { return null; }
}
