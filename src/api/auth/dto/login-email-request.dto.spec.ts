import { LoginEmailPostRequestDto } from './login-email-post-request.dto';
import { describe, it, expect } from '@jest/globals';

describe('VerifyPatchRequestDto', () => {
  it('should be defined', () => {
    expect(new LoginEmailPostRequestDto()).toBeDefined();
  });
});
