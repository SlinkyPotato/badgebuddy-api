import {
  describe,
  beforeEach,
  it,
  expect,
  jest,
  afterEach,
} from '@jest/globals';
import { ValidateGetActiveEventsQueryPipe } from './validate-get-active-events-query.pipe';
import { BadRequestException } from '@nestjs/common';
import GetActiveEventsRequestDto from '../dto/get/get-active-events.request.dto';

class TestableValidateGetActiveEventsQueryPipe extends ValidateGetActiveEventsQueryPipe {
  public validate(
    query: GetActiveEventsRequestDto,
    validatorOptions?: any,
  ): any {
    return super.validate(query, validatorOptions);
  }
}

describe('ValidateGetActiveEventsQueryPipe', () => {
  let pipe: TestableValidateGetActiveEventsQueryPipe;

  beforeEach(() => {
    pipe = new TestableValidateGetActiveEventsQueryPipe();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(pipe).toBeDefined();
  });

  it('should throw BadRequestException if query is invalid', () => {
    const mockRequest: GetActiveEventsRequestDto = {
      guildId: '850840267082563596',
      voiceChannelId: '850840267082563600',
      organizerId: '850840267082563596',
    };

    try {
      pipe.validate(mockRequest);
    } catch (e) {
      expect(e).toBeInstanceOf(BadRequestException);
      expect(e.message).toBe(
        'Too many parameters. Only organizerId and guildId can be used together.',
      );
    }
  });

  it('should throw BadRequestException if query is does not have organizerId and is too many', () => {
    const mockRequest: GetActiveEventsRequestDto = {
      guildId: '850840267082563596',
      voiceChannelId: '850840267082563600',
      eventId: '64e903cbac9d84d78747d109',
    };

    try {
      pipe.validate(mockRequest);
    } catch (e) {
      expect(e).toBeInstanceOf(BadRequestException);
      expect(e.message).toBe(
        'Too many parameters. Only organizerId and guildId can be used together.',
      );
    }
  });

  it('should return valid for organizerId & guildId', async () => {
    const mockRequest: GetActiveEventsRequestDto = {
      guildId: '850840267082563596',
      organizerId: '159014522542096384',
    };

    const result = await pipe.validate(mockRequest);
    expect(result.length).toBe(0);
  });

  it('should return valid for guildId', async () => {
    const mockRequest: GetActiveEventsRequestDto = {
      guildId: '850840267082563596',
    };

    const result = await pipe.validate(mockRequest);
    expect(result.length).toBe(0);
  });
});
