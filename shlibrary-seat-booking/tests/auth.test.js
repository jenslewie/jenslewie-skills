const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const auth = require('../scripts/lib/auth');

test('getAuth reads auth from file', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'shlibrary-auth-'));
  const authFile = path.join(tempDir, 'default.json');
  fs.writeFileSync(authFile, JSON.stringify({
    accessToken: 'file-token',
    sign: 'file-sign',
    timestamp: 'file-ts'
  }));

  const result = auth.getAuth({ authFile });
  assert.deepEqual(result, {
    accessToken: 'file-token',
    sign: 'file-sign',
    timestamp: 'file-ts',
    xEncode: null
  });
});

test('hasAnyEnvAuth remains false because auth env vars are unsupported', () => {
  assert.equal(auth.hasAnyEnvAuth(), false);
});
