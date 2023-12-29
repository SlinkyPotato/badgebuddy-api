import { Logger, Module } from '@nestjs/common';
import { PoapService } from './poap.service';
import { PoapController } from './poap.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [PoapController],
  providers: [PoapService, Logger],
  exports: [PoapService],
})
export class PoapModule {}
