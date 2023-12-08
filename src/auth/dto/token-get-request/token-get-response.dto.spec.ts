import { TokenPostResponseDto } from './token-get-response.dto';
import { describe, it, expect } from '@jest/globals';

describe('GetTokenResponseDto', () => {
  it('should be defined', () => {
    expect(new TokenPostResponseDto()).toBeDefined();
  });
});
