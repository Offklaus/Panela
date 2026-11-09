import { request } from './apiClient.js';

export const getProfile = () => request('GET', '/profile');
export const saveProfile = ({ nickname, birthDate, position, foot }) =>
  request('PUT', '/profile', { nickname, birthDate, position, foot });
