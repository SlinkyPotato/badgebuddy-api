import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { AuthorizeRequestGetDto } from '../dto/authorize-request-get.dto';
import { DataSource } from 'typeorm';
import { UserEntity } from '@badgebuddy/common';
import { log } from 'console';

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
    if (!request.userId) {
      this.logger.warn('userId is not set');
      return false;
    }
    return (async () => {
      const emailVerified = await this.dataSource
        .createQueryBuilder()
        .select('user.emailVerified')
        .from(UserEntity, 'user')
        .where('user.id = :id', { id: request.userId })
        .andWhere('user.emailVerified = true')
        .getOne();

      if (emailVerified) {
        this.logger.debug(`User ${request.userId} is email verified`);
        return true;
      }
      this.logger.warn(`User ${request.userId} is not email verified}`);
      return false;
    })();
  }
}
