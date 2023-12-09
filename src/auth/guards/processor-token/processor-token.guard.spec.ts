import { ProcessorTokenGuard } from './processor-token.guard';
import { describe, it, expect } from '@jest/globals';

describe('ProcessorTokenGuard', () => {
  it('should be defined', () => {
    expect(new ProcessorTokenGuard()).toBeDefined();
  });
});
