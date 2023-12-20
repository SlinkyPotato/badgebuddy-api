import { AuthTypePipe } from './auth-type.pipe';
import { describe, it, expect } from '@jest/globals';

describe('AuthTypePipe', () => {
  it('should be defined', () => {
    expect(new AuthTypePipe()).toBeDefined();
  });
});
