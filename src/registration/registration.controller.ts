import {
  Controller,
  Post,
  Body,
  Param,
  Delete,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { RegistrationService } from './registration.service';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { PostRegistrationRequestDto } from './dto/post-registration.request.dto';
import { PostRegistrationResponseDto } from './dto/post-registration.response.dto';

@ApiTags('registration')
@Controller('registration')
export class RegistrationController {
  constructor(
    private readonly registrationService: RegistrationService,
    private readonly logger: Logger,
  ) {}

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
    // this.logger.log('RegistrationController.create called');
    return this.registrationService.create(postRegistrationRequestDto);
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
