// DTO for auth response
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../../generated/prisma/client.js';

export class AuthResponseDto {
    @ApiProperty
    ({ description: 'Access token for authentication', example: '8d27c752730782d8c3ab9a95799a95085864370f634d9f08b93074f078763b6ba4a8baa83402f33e9d832825d91e058f862e342120e5139543f1a61434fac0af' })
    accessToken: string;

    @ApiProperty
    ({ description: 'Refresh token for obtaining new access token', example: 'e96f6592336c0dd51ff4fe916b93ad2181315f07b9d10f2d8bd45e9ac3d03f309b1c40c642f290ebe9729cfcbba24d5fda7da94505c5a21431d557bd7e731f2d39238863d58d9b29db8109ff0df40385c266b277bcd61e7cd95d7a087b46b6005516d52b375ebbf57b85d07ccfddc5996c315e99c69fcdbb586e750c' })
    refreshToken: string;

    @ApiProperty
    ({ description: 'Authenticated user information', example: {
            id: 'adio-23',
            email: '<EMAIL>',
            firstName: 'Ridwan',
            lastName: 'Abdulhammed',
            role: 'USER'
        }
    })
    user: {
        id: string;
        email: string;
        firstName: string | null;
        lastName: string | null;
        role: Role;
    }
}