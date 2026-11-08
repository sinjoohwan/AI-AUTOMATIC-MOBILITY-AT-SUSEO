import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { createOrder, listOrders, publishFleet, readFleet } from './server/orderStore.js';

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

function readJson(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8');
      if (!raw) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
}

function ordersDevApi() {
  return {
    name: 'suseo-orders-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url || '/', 'http://localhost');
        if (url.pathname !== '/api/orders' && url.pathname !== '/api/fleet') {
          next();
          return;
        }
        try {
          const body = req.method === 'POST' ? await readJson(req) : {};
          let status = 200;
          let payload;
          if (url.pathname === '/api/orders' && req.method === 'GET') payload = await listOrders(url.searchParams.get('after') || 0);
          else if (url.pathname === '/api/orders' && req.method === 'POST') {
            payload = await createOrder(body);
            status = payload.ok ? 201 : 400;
          } else if (url.pathname === '/api/fleet' && req.method === 'GET') payload = await readFleet();
          else if (url.pathname === '/api/fleet' && req.method === 'POST') payload = await publishFleet(body.robots || []);
          else {
            status = 405;
            payload = { ok: false, error: '지원하지 않는 요청입니다' };
          }
          res.statusCode = status;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.setHeader('Cache-Control', 'no-store');
          res.end(JSON.stringify(payload));
        } catch (error) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify({ ok: false, error: error.message || '주문 서버 오류' }));
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), ordersDevApi()],
  server: {
    allowedHosts: ['.trycloudflare.com'],
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(projectRoot, 'index.html'),
        mapTest: path.resolve(projectRoot, 'map-test.html'),
      },
    },
  },
});
