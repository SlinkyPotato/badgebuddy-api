import { Logger, Module } from '@nestjs/common';
import { PoapsService } from './poaps.service';
import { PoapsController } from './poaps.controller';

@Module({
  imports: [],
  controllers: [PoapsController],
  providers: [PoapsService, Logger],
})
export class PoapsModule {}
