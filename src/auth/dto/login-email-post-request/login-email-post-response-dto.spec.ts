import { LoginEmailPostResponseDto } from './login-email-post-response-dto';
import { describe, it, expect } from '@jest/globals';

describe('LoginEmailPostResponseDto', () => {
  it('should be defined', () => {
    expect(new LoginEmailPostResponseDto()).toBeDefined();
  });
});
