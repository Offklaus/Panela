import { request } from './apiClient.js';

export const getRules = () => request('GET', '/rules');
