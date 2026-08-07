import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionModule } from '../subscription/subscription.module';
import { Resource } from './entities/resource.entity';
import { AiGenerationJob } from './entities/ai-generation-job.entity';
import { ContactRequest } from './entities/contact-request.entity';
import { MistakeBook } from './entities/mistake-book.entity';
import { SpeakingAttempt } from './entities/speaking-attempt.entity';
import { VipUpgradeRequest } from './entities/vip-upgrade-request.entity';
import { ResourceService } from './resource.service';
import { AiJobService } from './ai-generation-job.service';
import { ContactService } from './contact-request.service';
import { MistakeBookService } from './mistake-book.service';
import { SpeakingService } from './speaking-attempt.service';
import { VipUpgradeService } from './vip-upgrade-request.service';
import { ResourceController } from './resource.controller';
import { AiJobController } from './ai-generation-job.controller';
import { ContactController } from './contact-request.controller';
import { MistakeBookController } from './mistake-book.controller';
import { SpeakingController } from './speaking-attempt.controller';
import { VipUpgradeController } from './vip-upgrade-request.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Resource, AiGenerationJob, ContactRequest, MistakeBook, SpeakingAttempt, VipUpgradeRequest]),
    SubscriptionModule,
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
