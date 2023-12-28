import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

@Injectable()
export class AuthTypePipe implements PipeTransform<string, string> {
  transform(value: string, metadata: ArgumentMetadata) {
    if (metadata.type !== 'query') {
      throw new BadRequestException('AuthTypePipe only supports query');
    }
    if (value === '') {
      throw new BadRequestException('type is required');
    }
    if (value === 'register' || value === 'login') {
      return value;
    }
    throw new BadRequestException('type only supports register or login');
  }
}
