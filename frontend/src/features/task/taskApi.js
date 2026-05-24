import baseUrl from '../../api/api';

const authHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export async function fetchTasks(params = {}) {
  const qs = new URLSearchParams();
  if (params.search) qs.set('search', params.search);
  if (params.category && params.category !== 'All') qs.set('category', params.category);
  if (params.priority && params.priority !== 'All') qs.set('priority', params.priority);
  if (params.status && params.status !== 'All') qs.set('status', params.status);

  const url = `${baseUrl.baseUrl}api/task/list${qs.toString() ? `?${qs}` : ''}`;
  const res = await fetch(url, { headers: authHeaders(), credentials: 'include' });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to load tasks');
  return json;
}

export async function createTask(payload) {
  const res = await fetch(`${baseUrl.baseUrl}api/task/save`, {
    method: 'POST',
    headers: authHeaders(),
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to create task');
  return json;
}
