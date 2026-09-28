// Jwt Strategy for auth requests
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service.js';


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {

    constructor (
        private prisma: PrismaService, 
        private configService: ConfigService
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.getOrThrow<string>('JWT_SECRET')
        })
    }



    // Validate Jwt payload
    async validate (payload: { sub: string, email: string}) {
        const user = await this.prisma.user.findUnique({
            where: { id: payload.sub },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                role: true,
                createdAt: true,
                updatedAt: true,
                password: false
            }
        });

        if (!user) {
            throw new UnauthorizedException('User not found');
        }
        return user;
    }
}