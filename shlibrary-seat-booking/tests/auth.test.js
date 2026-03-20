const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const auth = require('../scripts/lib/auth');

function withEnv(overrides, fn) {
  const previous = {
    SHL_LIBRARY_ACCESS_TOKEN: process.env.SHL_LIBRARY_ACCESS_TOKEN,
    SHL_LIBRARY_SIGN: process.env.SHL_LIBRARY_SIGN,
    SHL_LIBRARY_TIMESTAMP: process.env.SHL_LIBRARY_TIMESTAMP,
    SHL_LIBRARY_X_ENCODE: process.env.SHL_LIBRARY_X_ENCODE
  };

  for (const [key, value] of Object.entries(overrides)) {
    if (value == null) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }

  try {
    return fn();
  } finally {
    for (const [key, value] of Object.entries(previous)) {
      if (value == null) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  }
}

test('getAuth prefers complete env auth over file auth', () => {
  withEnv({
    SHL_LIBRARY_ACCESS_TOKEN: 'env-token',
    SHL_LIBRARY_SIGN: 'env-sign',
    SHL_LIBRARY_TIMESTAMP: 'env-ts',
    SHL_LIBRARY_X_ENCODE: 'env-x'
  }, () => {
    const result = auth.getAuth({ authFile: '/does/not/matter.json' });
    assert.deepEqual(result, {
      accessToken: 'env-token',
      sign: 'env-sign',
      timestamp: 'env-ts',
      xEncode: 'env-x'
    });
  });
});

test('getAuth falls back to file when env auth is incomplete', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'shlibrary-auth-'));
  const authFile = path.join(tempDir, 'default.json');
  fs.writeFileSync(authFile, JSON.stringify({
    accessToken: 'file-token',
    sign: 'file-sign',
    timestamp: 'file-ts'
  }));

  withEnv({
    SHL_LIBRARY_ACCESS_TOKEN: 'env-token',
    SHL_LIBRARY_SIGN: null,
    SHL_LIBRARY_TIMESTAMP: null,
    SHL_LIBRARY_X_ENCODE: null
  }, () => {
    const result = auth.getAuth({ authFile });
    assert.deepEqual(result, {
      accessToken: 'file-token',
      sign: 'file-sign',
      timestamp: 'file-ts',
      xEncode: null
    });
  });
});

test('hasAnyEnvAuth detects partial env auth', () => {
  withEnv({
    SHL_LIBRARY_ACCESS_TOKEN: 'env-token',
    SHL_LIBRARY_SIGN: null,
    SHL_LIBRARY_TIMESTAMP: null,
    SHL_LIBRARY_X_ENCODE: null
  }, () => {
    assert.equal(auth.hasAnyEnvAuth(), true);
  });
});
