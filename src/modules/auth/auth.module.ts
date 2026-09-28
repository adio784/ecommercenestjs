import { Module } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { PrismaModule } from '../../prisma/prisma.module.js';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy.js';
import { RefreshTokenStrategy } from './strategies/refresh-token.strategy.js';

@Module({
  imports: [
    PrismaModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({ 
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
            // secret: configService.get<string>('JWT_SECRET'),
            secret: configService.getOrThrow<string>('JWT_SECRET') ?? 'defaultsecret2025',
            signOptions: { expiresIn: Number(configService.get<number>('JWT_EXPIRES_IN', 900))},
        }),
        inject: [ConfigService],
     }),
  ],
  providers: [AuthService, JwtStrategy, RefreshTokenStrategy],
  controllers: [AuthController],
  exports: [AuthService, JwtModule],

})
export class AuthModule {}
