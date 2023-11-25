import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { AuthorizeRequestGetDto } from '../dto/authorize-request-get.dto';
import { DataSource } from 'typeorm';
import { UserEntity } from '@badgebuddy/common';

@Injectable()
export class UserGuard implements CanActivate {

  constructor(
    private readonly logger: Logger,
    private dataSource: DataSource,
  ) { }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request: AuthorizeRequestGetDto = context.switchToHttp().getRequest().query as AuthorizeRequestGetDto;
    return (async () => {
      const emailVerified = await this.dataSource
        .createQueryBuilder()
        .select('user.emailVerified')
        .from(UserEntity, 'user')
        .where('user.id = :id', { id: request.userId })
        .andWhere('user.emailVerified = true')
        .getOne();

      if (emailVerified) {
        this.logger.debug(`User ${request.userId} is email verified on ${emailVerified}`);
        return true;
      }

      return false;
    })();
  }
}
