import { Controller, Get, Post, Param, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { RewardsService } from './rewards.service';
import { RedeemRewardDto } from '../dto/rewards.dto';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

function ok(data: unknown, msg: string) {
  return { data, message: msg };
}

/**
 * RewardsController — student-facing reward shop (PR-33).
 * GET /rewards — catalog; POST /rewards/:id/redeem; GET /rewards/inventory.
 */
@Controller('rewards')
export class RewardsController {
  constructor(private readonly svc: RewardsService) {}

  @Get()
  async getCatalog(@CurrentUser('sub') userId: string) {
    return ok(await this.svc.getCatalog(userId), 'Rewards catalog');
  }

  @Get('inventory')
  async getInventory(@CurrentUser('sub') userId: string) {
    return ok(await this.svc.getInventory(userId), 'Reward inventory');
  }

  @Post(':id/redeem')
  @HttpCode(HttpStatus.OK)
  async redeem(
    @Param('id') id: string,
    @Body() dto: RedeemRewardDto,
    @CurrentUser('sub') userId: string,
  ) {
    return ok(await this.svc.redeem(userId, id, dto.idempotencyKey), 'Reward redeemed');
  }
}
