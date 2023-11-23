import { AuthorizeRequestGetDto } from './get-authorize-request.dto';

describe('GetAuthorizeRequestDto', () => {
  it('should be defined', () => {
    expect(new AuthorizeRequestGetDto()).toBeDefined();
  });
});
