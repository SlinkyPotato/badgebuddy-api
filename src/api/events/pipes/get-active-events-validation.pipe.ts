import {
  BadRequestException,
  Injectable,
  ValidationPipe,
} from '@nestjs/common';
import { ValidationError, ValidatorOptions } from 'class-validator';
import GetActiveEventsRequestDto from '../dto/get/get-active-events.request.dto';

@Injectable()
export class GetActiveEventsValidationPipe extends ValidationPipe {
  protected validate(
    query: GetActiveEventsRequestDto,
    validatorOptions?: ValidatorOptions,
  ): Promise<ValidationError[]> | ValidationError[] {
    const numOfParams = Object.keys(query).length;
    if (query.organizerId && query.guildId && numOfParams > 2) {
      throw new BadRequestException(
        'Too many parameters. Only organizerId and guildId can be used together.',
      );
    }
    if (query.organizerId && query.guildId && numOfParams == 2) {
      return super.validate(query, validatorOptions);
    }
    if (numOfParams > 1) {
      throw new BadRequestException(
        'Too many parameters. Only organizerId and guildId can be used together.',
      );
    }
    return super.validate(query, validatorOptions);
  }
}
