import { RefreshTokenPostResponseDto } from './refresh-token-post-response.dto';
import { describe, it, expect } from '@jest/globals';

describe('RefreshTokenPostResponseDto', () => {
  it('should be defined', () => {
    expect(new RefreshTokenPostResponseDto()).toBeDefined();
  });
});
