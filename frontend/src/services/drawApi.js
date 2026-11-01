import { request } from './apiClient.js';

export const getDraw = () => request('GET', '/draw');
export const createDraw = () => request('POST', '/draw', {});
