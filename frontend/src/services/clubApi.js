import { request } from './apiClient.js';

export const getClub = () => request('GET', '/club');
export const createClub = ({ name, icon }) => request('POST', '/club', { name, icon });