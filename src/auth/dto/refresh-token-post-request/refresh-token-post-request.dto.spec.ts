import { RefreshTokenPostRequestDto } from './refresh-token-post-request.dto';
import { describe, it, expect } from '@jest/globals';

describe('RefreshTokenPostRequestDto', () => {
  it('should be defined', () => {
    expect(new RefreshTokenPostRequestDto()).toBeDefined();
  });
});
