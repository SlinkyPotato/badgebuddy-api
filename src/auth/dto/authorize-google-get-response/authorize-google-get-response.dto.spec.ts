import { AuthorizeGoogleGetResponseDto } from './authorize-google-get-response.dto';
import { describe, it, expect } from '@jest/globals';

describe('AuthorizeGoogleGetResponseDto', () => {
  it('should be defined', () => {
    expect(new AuthorizeGoogleGetResponseDto()).toBeDefined();
  });
});
