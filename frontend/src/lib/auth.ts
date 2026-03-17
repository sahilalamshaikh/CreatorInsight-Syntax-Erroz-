import Cookies from 'js-cookie';

export function setTokens(accessToken: string, refreshToken: string) {
  Cookies.set('access_token', accessToken, { expires: 1 });
  Cookies.set('refresh_token', refreshToken, { expires: 30 });
}

export function clearTokens() {
  Cookies.remove('access_token');
  Cookies.remove('refresh_token');
}

export function getToken() {
  return Cookies.get('access_token');
}

export function isLoggedIn() {
  return !!Cookies.get('access_token');
}
