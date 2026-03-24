import { post, get }    from '../httpClient';
import { clearToken } from '../httpClient';

/**
 * AUTH SERVICE
 * ─────────────────────────────────────────────
 * POST /auth/register    → { user, accessToken, refreshToken }
 * POST /auth/login       → { user, accessToken, refreshToken }
 * POST /auth/logout      → null
 * GET  /auth/me          → User
 * POST /auth/refresh     → { accessToken, refreshToken }
 * POST /auth/forgot-password → { message }
 * POST /auth/google      → { user, accessToken, refreshToken }
 * POST /auth/apple       → { user, accessToken, refreshToken }
 * POST /auth/role        → { user, accessToken }
 */

function saveSession({ accessToken, refreshToken, user }) {
  if (accessToken)  localStorage.setItem('sw_token',    accessToken);
  if (refreshToken) localStorage.setItem('sw_refresh',  refreshToken);
  if (user)         localStorage.setItem('sw_user',     JSON.stringify(user));
}

// ── Register ───────────────────────────────────────────────
export async function registerUser({ username, email, password, role }) {
  const data = await post('/auth/register', { username, email, password, role });
  saveSession(data);
  return data;
}

// ── Login ──────────────────────────────────────────────────
export async function loginUser({ email, password }) {
  const data = await post('/auth/login', { email, password });
  saveSession(data);
  return data;
}

// ── Logout ─────────────────────────────────────────────────
export async function logoutUser() {
  await post('/auth/logout').catch(() => {});
  clearToken();
  localStorage.removeItem('sw_refresh');
  localStorage.removeItem('sw_user');
}

// ── Current user ───────────────────────────────────────────
export async function getMe() {
  return get('/auth/me');
}

// ── Refresh token ──────────────────────────────────────────
export async function refreshToken() {
  const refresh = localStorage.getItem('sw_refresh');
  if (!refresh) throw new Error('No refresh token');
  const data = await post('/auth/refresh', { refreshToken: refresh });
  saveSession(data);
  return data;
}

// ── Forgot password ────────────────────────────────────────
export async function forgotPassword({ email }) {
  return post('/auth/forgot-password', { email });
}

// ── OAuth: Google ──────────────────────────────────────────
// code — OAuth2 authorization code из Google redirect
export async function loginWithGoogle({ code }) {
  const redirect_uri = `${window.location.origin}/auth/callback`;
  const data = await post('/auth/google', { code, redirect_uri });
  const user = data.user ?? data;
  saveSession({ ...data, user });
  return { user };
}

// ── OAuth: Apple ───────────────────────────────────────────
// identityToken — JWT от Apple Sign In
export async function loginWithApple({ identityToken, authorizationCode }) {
  const data = await post('/auth/apple', { identityToken, authorizationCode });
  saveSession(data);
  return data;
}

// ── Set role (after OAuth) ─────────────────────────────────
// role: 'buyer' | 'creator'
export async function setUserRole({ role }) {
  const data = await post('/auth/role', { role });
  saveSession(data);
  return data;
}

// ── Local helpers ──────────────────────────────────────────
export function getCurrentUser() {
  try {
    const raw = localStorage.getItem('sw_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
