import { LoginGooglePostRequestDto } from './login-google-post-request-dto';
import { describe, it, expect } from '@jest/globals';

describe('LoginGooglePostRequestDto', () => {
  it('should be defined', () => {
    expect(new LoginGooglePostRequestDto()).toBeDefined();
  });
});
