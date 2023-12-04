import { UserTokenGuard } from './user-token.guard';

describe('UserTokenGuard', () => {
  it('should be defined', () => {
    expect(new UserTokenGuard()).toBeDefined();
  });
});
