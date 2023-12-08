import { TokenDto } from './token.dto';
import { describe, it, expect } from '@jest/globals';

describe('Token', () => {
  it('should be defined', () => {
    expect(new TokenDto()).toBeDefined();
  });
});
