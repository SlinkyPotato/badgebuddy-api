import { RegisterPostResponseDto } from './register-post-response.dto';
import { describe, it, expect } from '@jest/globals';

describe('RegisterPostResponseDto', () => {
  it('should be defined', () => {
    expect(new RegisterPostResponseDto()).toBeDefined();
  });
});
