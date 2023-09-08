import { beforeEach, describe, it, expect } from '@jest/globals';
import { GuildsModule } from './guilds.module';

describe('GuildsModule', () => {
  let module: GuildsModule;

  beforeEach(async () => {
    module = new GuildsModule();
  });

  it('should be defined', () => {
    expect(module).toBeTruthy();
  });
});
