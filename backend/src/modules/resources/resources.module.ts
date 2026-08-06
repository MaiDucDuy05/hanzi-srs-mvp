import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Resource } from './entities/resource.entity';
import { AiGenerationJob } from './entities/ai-generation-job.entity';
import { ContactRequest } from './entities/contact-request.entity';
import { MistakeBook } from './entities/mistake-book.entity';
import { SpeakingAttempt } from './entities/speaking-attempt.entity';
import { VipUpgradeRequest } from './entities/vip-upgrade-request.entity';
import { ResourceService, AiJobService, ContactService, MistakeBookService, SpeakingService, VipUpgradeService } from './resources.service';
import { ResourceController, AiJobController, ContactController, MistakeBookController, SpeakingController, VipUpgradeController } from './resources.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Resource, AiGenerationJob, ContactRequest, MistakeBook, SpeakingAttempt, VipUpgradeRequest]),
  ],
  controllers: [
    ResourceController, AiJobController, ContactController, MistakeBookController, SpeakingController, VipUpgradeController,
  ],
  providers: [
    ResourceService, AiJobService, ContactService, MistakeBookService, SpeakingService, VipUpgradeService,
  ],
  exports: [ResourceService, AiJobService, MistakeBookService],
})
export class ResourcesModule {}
