import { Injectable } from '@nestjs/common';
import PostEventRequestDto from './dto/post/event.request.dto';

@Injectable()
export class EventsService {
  create(id: string, request: PostEventRequestDto): Promise<string> {
    return Promise.resolve('event');
  }
}
