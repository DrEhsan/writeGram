const assert = require('assert');
const app = require('../../source/app');

describe('\'friends\' service', () => {
  it('registered the service', () => {
    const service = app.service('friends');

    assert.ok(service, 'Registered the service');
  });
});
