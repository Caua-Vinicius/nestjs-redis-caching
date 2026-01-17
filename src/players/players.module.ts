import { Module } from '@nestjs/common';
import { PlayersService } from './players.service';
import { PlayersController } from './players.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  providers: [PlayersService, PrismaService],
  controllers: [PlayersController],
})
export class PlayersModule {}
