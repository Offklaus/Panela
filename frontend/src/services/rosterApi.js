import { request } from './apiClient.js';

export const getRoster = () => request('GET', '/roster');
export const addPlayer = ({ name, rating }) => request('POST', '/players', { name, rating });
export const updatePlayer = (id, changes) => request('PATCH', `/players/${id}`, changes);
export const removePlayer = (id) => request('DELETE', `/players/${id}`);
export const setPresence = (id, present) => updatePlayer(id, { present });
export const setAllPresence = (present) => request('PUT', '/players/presence', { present });
