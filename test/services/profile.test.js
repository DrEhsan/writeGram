const assert = require('assert');
const app = require('../../source/app');

describe('\'profile\' service', () => {
  it('registered the service', () => {
    const service = app.service('profile');

    assert.ok(service, 'Registered the service');
  });
});
