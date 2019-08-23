const assert = require('assert');
const app = require('../../source/app');

describe('\'chats\' service', () => {
  it('registered the service', () => {
    const service = app.service('chats');

    assert.ok(service, 'Registered the service');
  });
});
