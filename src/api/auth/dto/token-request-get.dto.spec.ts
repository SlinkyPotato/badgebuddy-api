
import { describe, it, expect } from '@jest/globals';
import { TokenRequestGetDto } from './token-request-get.dto';

describe('GetTokenRequestDto', () => {
  it('should be defined', () => {
    expect(new TokenRequestGetDto()).toBeDefined();
  });
});
