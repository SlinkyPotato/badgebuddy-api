import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class AuthTypePipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (metadata.type !== 'query') {
      throw new BadRequestException('AuthTypePipe only supports query');
    }
    if (value === undefined || value === '') {
      throw new BadRequestException('type is required');
    }
    if (value === 'register' || value === 'login') {
      return value;
    }
    throw new BadRequestException('type only supports register or login');
  }
}
