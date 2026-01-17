import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  UseInterceptors,
} from '@nestjs/common';
import { PlayersService } from './players.service';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { Player } from 'src/generated/prisma/client';

@Controller('players')
export class PlayersController {
  constructor(private readonly playersService: PlayersService) {}

  @Get(':id')
  async getPlayerById(@Param('id', ParseIntPipe) id: number): Promise<{
    source: string;
    data: Player;
  }> {
    return await this.playersService.getPlayerById(id);
  }

  @UseInterceptors(CacheInterceptor)
  @Get()
  async getAllPlayers(): Promise<Player[]> {
    return await this.playersService.getAllPlayers();
  }

  // Although DTOs are standard for data transfer, they were omitted here to focus on the caching implementation.
  @Patch(':id')
  async updatePlayer(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: { nickname: string },
  ): Promise<Player> {
    return await this.playersService.updatePlayer(data, id);
  }
}
