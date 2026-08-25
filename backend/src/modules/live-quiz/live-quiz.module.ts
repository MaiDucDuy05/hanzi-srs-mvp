import { Module } from '@nestjs/common';
import { LiveQuizGateway } from './live-quiz.gateway';
import { LiveQuizService } from './live-quiz.service';

@Module({
  providers: [LiveQuizGateway, LiveQuizService],
  exports: [LiveQuizService],
})
export class LiveQuizModule {}
