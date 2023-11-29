import { AuthorizeRequestGetDto } from './get-authorize-request.dto';
import { describe, it, expect } from '@jest/globals';

describe('GetAuthorizeRequestDto', () => {
  it('should be defined', () => {
    expect(new AuthorizeRequestGetDto()).toBeDefined();
  });
});
