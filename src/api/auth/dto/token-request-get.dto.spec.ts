import { TokenRequestGetDto } from './get-token-request.dto';

describe('GetTokenRequestDto', () => {
  it('should be defined', () => {
    expect(new TokenRequestGetDto()).toBeDefined();
  });
});
