import {
  Controller,
  Post,
  Body,
  Param,
  Delete,
  HttpStatus,
  Logger,
  Inject,
  Get,
} from '@nestjs/common';
import { RegistrationService } from './registration.service';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { PostRegistrationRequestDto } from './dto/post-registration.request.dto';
import { PostRegistrationResponseDto } from './dto/post-registration.response.dto';
import { Agent } from 'elastic-apm-node';
import GetRegistrationResponseDto from './dto/get-registration.response.dto';

@ApiTags('registration')
@Controller('registration')
export class RegistrationController {
  constructor(
    private readonly registrationService: RegistrationService,
    private readonly logger: Logger,
    @Inject('APM') private readonly apm: Agent,
  ) {}

  @Get(':id')
  @ApiResponse({
    status: HttpStatus.FOUND,
    description: 'Server found',
    type: GetRegistrationResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Server not found',
  })
  get(@Param('id') id: string): Promise<GetRegistrationResponseDto> {
    return this.registrationService.get(id.toString());
  }

  @Post()
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Server registered',
    type: PostRegistrationResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Server already registered',
  })
  create(
    @Body() postRegistrationRequestDto: PostRegistrationRequestDto,
  ): Promise<PostRegistrationResponseDto> {
    this.apm.startTransaction('create registration', 'controller');
    const res = this.registrationService.create(postRegistrationRequestDto);
    this.apm.endTransaction();
    return res;
  }

  @Delete(':id')
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Server removed' })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Server not found',
  })
  remove(@Param('id') id: string) {
    return this.registrationService.remove(id);
  }
}
