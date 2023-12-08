import { describe, beforeEach, it, expect } from '@jest/globals';
import { HealthModule } from './health.module';

describe('HealthModule', () => {
  let module: HealthModule;

  beforeEach(async () => {
    module = new HealthModule();
  });

  it('should be defined', () => {
    expect(module).toBeTruthy();
  });
});
