import { ClientIdGuard } from './client-id-guard.service';

describe('ClientGuard', () => {
  it('should be defined', () => {
    expect(new ClientIdGuard()).toBeDefined();
  });
});
