import { AuthorizeEmailPostRequestDto } from './authorize-email-post-request.dto';
import { describe, it, expect } from '@jest/globals';

describe('AuthorizeEmailPostRequestDto', () => {
  it('should be defined', () => {
    expect(new AuthorizeEmailPostRequestDto()).toBeDefined();
  });
});
