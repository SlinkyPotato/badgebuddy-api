import { EmailCodePipe } from './email-code.pipe';
import { describe, it, expect } from '@jest/globals';

describe('EmailCodePipe', () => {
  it('should be defined', () => {
    expect(new EmailCodePipe()).toBeDefined();
  });
});
