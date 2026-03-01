import test from 'node:test';
import assert from 'node:assert/strict';
import { server } from './index.js';

test('health endpoint responds ok', async () => {
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const res = await fetch(`http://127.0.0.1:${port}/health`);
  const body = await res.json();
  assert.equal(body.ok, true);
  server.close();
});
