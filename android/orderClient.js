async function request(url, options) {
  const response = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.ok === false) {
    throw new Error(data.error || '서버와 통신하지 못했습니다');
  }
  return data;
}

export function fetchOrders(after = 0) {
  return request(`/api/orders?after=${encodeURIComponent(after)}`);
}

export function sendOrder(order) {
  return request('/api/orders', { method: 'POST', body: JSON.stringify(order) });
}

export function fetchFleet() {
  return request('/api/fleet');
}

export function sendFleet(robots) {
  return request('/api/fleet', { method: 'POST', body: JSON.stringify({ robots }) });
}
