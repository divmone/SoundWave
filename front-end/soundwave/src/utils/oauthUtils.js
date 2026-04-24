/**
 * oauthUtils.js
 *
 * Утилиты для OAuth2 flow (Google, Apple).
 *
 * FLOW:
 *  1. Пользователь нажимает "Continue with Google"
 *  2. Браузер редиректит на accounts.google.com
 *  3. После согласия Google редиректит обратно на REDIRECT_URI с ?code=...
 *  4. Мы берём code из URL и отправляем POST /auth/google { code }
 *  5. Бэкенд обменивает code на tokens, возвращает { user, accessToken, refreshToken }
 *  6. Если user.role === null → показываем RoleSelectPage
 *  7. Иначе → логиним пользователя
 *
 * Для Apple аналогично, но через AppleID.auth.signIn() (Safari Web SDK).
 */

// ── Config ────────────────────────────────────────────────
// Замени на свои credentials из Google Cloud Console / Apple Developer
const GOOGLE_CLIENT_ID  = "251762912684-hsofsg384fmjmlahr560c953i1ejqj7i.apps.googleusercontent.com"
const APPLE_CLIENT_ID   = 'soundwave.divmone.ru';
const REDIRECT_URI      = `${window.location.origin}/auth/callback`

// ── Google ────────────────────────────────────────────────
/**
 * Строит URL для редиректа на Google OAuth consent screen.
 * После согласия Google вернёт: REDIRECT_URI?code=...&state=google
 */
export function buildGoogleAuthUrl() {
  const params = new URLSearchParams({
    client_id:     GOOGLE_CLIENT_ID,
    redirect_uri:  REDIRECT_URI,
    response_type: 'code',
    scope:         'openid email profile',
    access_type:   'offline',
    prompt:        'select_account',
    state:         'google',
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

/**
 * Редиректит пользователя на Google.
 * После возврата — парсим code через parseOAuthCallback().
 */
export function redirectToGoogle() {
  window.location.href = buildGoogleAuthUrl();
}

// ── Apple ─────────────────────────────────────────────────
/**
 * Строит URL для редиректа на Apple Sign In.
 * После согласия Apple вернёт: REDIRECT_URI с form POST (identityToken, code).
 * Бэкенд должен валидировать identityToken через Apple Public Keys.
 */
export function buildAppleAuthUrl() {
  const params = new URLSearchParams({
    client_id:     APPLE_CLIENT_ID,
    redirect_uri:  REDIRECT_URI,
    response_type: 'code',
    response_mode: 'query',
    state:         'apple',
  });
  return `https://appleid.apple.com/auth/authorize?${params}`;
}

export function redirectToApple() {
  window.location.href = buildAppleAuthUrl();
}

// ── Parse callback ────────────────────────────────────────
/**
 * Парсит параметры из URL после OAuth редиректа.
 * Возвращает { provider, code, identityToken, error } или null.
 *
 * Вызывай при загрузке страницы /auth/callback.
 */
export function parseOAuthCallback() {
  const params = new URLSearchParams(window.location.search);
  const state  = params.get('state');
  const error  = params.get('error');

  if (error) return { error };

  if (state === 'google') {
    const code = params.get('code');
    if (code) return { provider: 'google', code };
  }

  if (state === 'apple') {
    const code = params.get('code');
    if (code) return { provider: 'apple', code };
  }

  return null;
}
