import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
  MemoryHealthIndicator,
  MongooseHealthIndicator,
} from '@nestjs/terminus';

@Controller('health')
@ApiTags('Healthcheck')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private db: MongooseHealthIndicator,
    private memory: MemoryHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () =>
        this.http.responseCheck(
          'badge-buddy-api',
          'http://localhost:3000/swagger',
          (res) => res.status === 200,
        ),
      () => this.db.pingCheck('mongo'),
      () => this.memory.checkRSS('memory_rss', 1000 * 1024 * 1024), // 1GB
    ]);
  }
}
