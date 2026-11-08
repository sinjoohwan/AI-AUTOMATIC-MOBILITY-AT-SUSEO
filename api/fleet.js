import { publishFleet, readFleet } from '../server/orderStore.js';

function send(res, status, body) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.status(status).json(body);
}

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      send(res, 200, await readFleet());
      return;
    }
    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
      send(res, 200, await publishFleet(body.robots || []));
      return;
    }
    send(res, 405, { ok: false, error: '지원하지 않는 요청입니다' });
  } catch (error) {
    send(res, 500, { ok: false, error: error.message || '로봇 상태 서버 오류' });
  }
}
