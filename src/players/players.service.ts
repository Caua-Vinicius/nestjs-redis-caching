import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Player } from 'src/generated/prisma/client';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class PlayersService {
  private readonly logger = new Logger(PlayersService.name);
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async getAllPlayers(): Promise<Player[]> {
    const start = performance.now();

    // Simulating a heavy load
    const players = await this.prisma.player.findMany({
      take: 10000,
    });

    const end = performance.now();

    this.logger.warn(
      `🐌 DATABASE LOAD: ${(end - start).toFixed(2)}ms to fetch ${players.length} items.`,
    );
    return players;
  }

  async getPlayerById(id: number): Promise<{ source: string; data: Player }> {
    const cacheKey = `player:${id}`;

    const cachedPlayer: Player = await this.cacheManager.get(cacheKey);

    if (cachedPlayer) return { source: 'Redis', data: cachedPlayer };

    const player: Player = await this.prisma.player.findUniqueOrThrow({
      where: { id },
    });

    await this.cacheManager.set(cacheKey, player, 1000 * 60 * 5); // 5 minutes

    return { source: 'Database', data: player };
  }

  async updatePlayer(data: { nickname: string }, id: number) {
    const cacheKey = `player:${id}`;

    const player = await this.prisma.player.update({
      where: {
        id,
      },
      data,
    });
    // Removing any usage of this player because the saved data would be outdated, also its possible to update instead of deleting
    await this.cacheManager.del(cacheKey);
    return player;
  }
}
