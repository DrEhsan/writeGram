const assert = require('assert');
const app = require('../../source/app');

describe('\'friendship\' service', () => {
  it('registered the service', () => {
    const service = app.service('friendship');

    assert.ok(service, 'Registered the service');
  });
});
