import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
  MemoryHealthIndicator,
} from '@nestjs/terminus';
import type { HealthCheckResult } from '@nestjs/terminus/dist/health-check/health-check-result.interface';

@Controller('health')
@ApiTags('Healthcheck')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private memory: MemoryHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  async check(): Promise<HealthCheckResult> {
    const result = await this.health.check([
      () =>
        this.http.responseCheck(
          'badge-buddy-api',
          'http://localhost:3000/swagger',
          (res) => res.status === 200,
        ),
      () => this.memory.checkRSS('memory_rss', 1000 * 1024 * 1024), // 1GB
    ]);
    return result;
  }
}
