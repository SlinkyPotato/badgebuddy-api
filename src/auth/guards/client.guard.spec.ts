import { ClientIdGuard } from './client-id-guard.service';
import { describe, it, expect } from '@jest/globals';

describe('ClientGuard', () => {
  it('should be defined', () => {
    expect(new ClientIdGuard()).toBeDefined();
  });
});
