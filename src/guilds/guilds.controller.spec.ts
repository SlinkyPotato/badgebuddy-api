import { Test, TestingModule } from '@nestjs/testing';
import { GuildsController } from './guilds.controller';
import { GuildsService } from './guilds.service';

describe('RegistrationController', () => {
  let controller: GuildsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GuildsController],
      providers: [GuildsService],
    }).compile();

    controller = module.get<GuildsController>(GuildsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});