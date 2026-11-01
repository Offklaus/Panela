import { request } from './apiClient.js';

export const signup = ({ email, password }) => request('POST', '/auth/signup', { email, password });
export const login = ({ email, password }) => request('POST', '/auth/login', { email, password });
export const logout = () => request('POST', '/auth/logout', {});
export const me = () => request('GET', '/auth/me');
export const requestPasswordReset = (email) => request('POST', '/auth/password-reset/request', { email });
export const confirmPasswordReset = (token, password) =>
  request('POST', '/auth/password-reset/confirm', { token, password });
