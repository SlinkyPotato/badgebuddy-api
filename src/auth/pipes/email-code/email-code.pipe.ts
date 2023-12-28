import {
  ArgumentMetadata,
  Injectable,
  InternalServerErrorException,
  PipeTransform,
  UnprocessableEntityException,
} from '@nestjs/common';
import base64url from 'base64url';

export type EmailCode = {
  email: string;
  code: string;
};

@Injectable()
export class EmailCodePipe implements PipeTransform<string, EmailCode> {
  transform(value: string, metadata: ArgumentMetadata): EmailCode {
    if (metadata.type !== 'body') {
      throw new InternalServerErrorException(
        'EmailCodePipe only supports body',
      );
    }
    const [requestEmail, requestRandomHash] = base64url
      .decode(value)
      .split(':');
    if (!requestEmail || !requestRandomHash) {
      throw new UnprocessableEntityException('Email verification invalid');
    }
    return {
      email: requestEmail,
      code: requestRandomHash,
    };
  }
}
