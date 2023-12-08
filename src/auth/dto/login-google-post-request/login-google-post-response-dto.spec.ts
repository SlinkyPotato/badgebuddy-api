import { LoginGooglePostResponseDto } from './login-google-post-response-dto';
import { describe, it, expect } from '@jest/globals';

describe('LoginGooglePostResponseDto', () => {
  it('should be defined', () => {
    expect(new LoginGooglePostResponseDto()).toBeDefined();
  });
});
