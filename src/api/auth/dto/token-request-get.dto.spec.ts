
import { describe, it, expect } from '@jest/globals';
import { TokenGetRequestDto } from './token-get-request.dto';

describe('GetTokenRequestDto', () => {
  it('should be defined', () => {
    expect(new TokenGetRequestDto()).toBeDefined();
  });
});
