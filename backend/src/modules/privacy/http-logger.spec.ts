import express from 'express';
import morgan from 'morgan';
import { AddressInfo } from 'net';
import { httpLogFormat } from '../../middlewares/http-logger.middleware';

describe('HTTP access log minimization', () => {
  it('logs operational metadata without URL, headers, IP or body on success and 404', async () => {
    const lines: string[] = [];
    const app = express();
    app.use(morgan(httpLogFormat, { stream: { write: line => lines.push(line) } }));
    app.post('/known/:id', (_req, res) => { res.sendStatus(201); });
    const server = app.listen(0, '127.0.0.1');
    await new Promise<void>(resolve => server.once('listening', resolve));
    try {
      const port = (server.address() as AddressInfo).port;
      for (const path of ['/known/person@example.com?token=secret-query', '/missing/secret-path']) {
        const response = await fetch(`http://127.0.0.1:${port}${path}`, {
          method: 'POST',
          headers: {
            Authorization: 'Bearer secret-header', Cookie: 'session=secret-cookie',
            Referer: 'https://example.com/?token=secret-referer',
            'User-Agent': 'secret-agent', 'Content-Type': 'text/plain',
            'X-Forwarded-For': '203.0.113.9',
          },
          body: 'secret-body',
        });
        await response.text();
      }
      expect(lines).toHaveLength(2);
      expect(lines.map(line => JSON.parse(line).status)).toEqual([201, 404]);
      for (const line of lines) {
        expect(JSON.parse(line)).toEqual({
          event: 'http.request', method: 'POST', status: expect.any(Number), durationMs: expect.any(Number),
        });
        expect(line).not.toMatch(/secret|example\.com|203\.0\.113|127\.0\.0|known|missing/);
      }
    } finally {
      await new Promise<void>((resolve, reject) => server.close(err => err ? reject(err) : resolve()));
    }
  });
});
