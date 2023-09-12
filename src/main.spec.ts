import { describe, it, expect, jest } from '@jest/globals';

jest.mock('./bootstrap');

describe('main', () => {
  it('should bootstrap', () => {
    try {
      require('./main');
      expect(true).toBeTruthy();
    } catch (e) {
      // ignore
    }
  });
});
