import { AuthorizeResponseGetDto } from './get-authorize-reponse.dto';
import { describe, it, expect } from '@jest/globals';

describe('GetAuthorizeResponse', () => {
  it('should be defined', () => {
    expect(new AuthorizeResponseGetDto()).toBeDefined();
  });
});
