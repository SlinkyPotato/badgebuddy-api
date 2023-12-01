import { UserDto } from './user.dto';
import { describe, it, expect } from '@jest/globals';

describe('UserDto', () => {
  it('should be defined', () => {
    expect(new UserDto()).toBeDefined();
  });
});
