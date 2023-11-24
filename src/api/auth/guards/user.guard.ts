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
      // Check DB is user ID exists and is email verified
      const userId = await this.dataSource
        .createQueryBuilder()
        .select('user.id')
        .from(UserEntity, 'user')
        .where('user.id = :id', { id: request.userId })
        .andWhere('user.emailVerified = true')
        .getOne();

      console.log(userId);

      return (userId) ? true : false;
    })();
  }
}
