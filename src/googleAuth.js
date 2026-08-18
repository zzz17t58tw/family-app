import { GOOGLE_CLIENT_ID, GOOGLE_SCOPES } from './config';

let tokenClient = null;
let accessToken = null;
let tokenExpiry = 0;
let onTokenChange = null;

// 初始化 Google 登入（index.html 需載入 GIS script）
export function initGoogleAuth(onReady) {
  // 從 localStorage 恢復 token
  try {
    const saved = JSON.parse(localStorage.getItem('family_app_token') || 'null');
    if (saved && saved.expiry > Date.now()) {
      accessToken = saved.token;
      tokenExpiry = saved.expiry;
    }
  } catch (e) { /* ignore */ }

  const doInit = () => {
    tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: GOOGLE_SCOPES,
      callback: (resp) => {
        if (resp.error) {
          console.error('授權失敗', resp);
          if (onTokenChange) onTokenChange(null);
          return;
        }
        accessToken = resp.access_token;
        tokenExpiry = Date.now() + (resp.expires_in || 3600) * 1000;
        localStorage.setItem('family_app_token', JSON.stringify({ token: accessToken, expiry: tokenExpiry }));
        if (onTokenChange) onTokenChange(accessToken);
      },
    });
    // tokenClient 初始化後，GIS 會自動處理 redirect 回來的 code（手機跳轉登入）
    if (onReady) onReady();
  };

  if (window.google && window.google.accounts) {
    doInit();
  } else {
    let attempts = 0;
    const tryInit = () => {
      if (window.google && window.google.accounts) {
        doInit();
      } else if (attempts < 50) {
        attempts++;
        setTimeout(tryInit, 50);
      } else {
        if (onReady) onReady();
      }
    };
    tryInit();
  }
}

export function setTokenChangeHandler(fn) { onTokenChange = fn; }

export function signIn() {
  if (tokenClient) tokenClient.requestAccessToken();
}

export function signOut() {
  accessToken = null;
  tokenExpiry = 0;
  localStorage.removeItem('family_app_token');
  if (window.google && window.google.accounts && window.google.accounts.id) {
    google.accounts.id.disableAutoSelect();
  }
  if (onTokenChange) onTokenChange(null);
}

export function getAccessToken() {
  if (accessToken && Date.now() < tokenExpiry) return accessToken;
  return null;
}

export function isSignedIn() {
  return !!getAccessToken();
}
