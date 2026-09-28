import { ApiOperation, ApiProperty } from "@nestjs/swagger";
import { Role } from "../../../generated/prisma/enums.js";

export class UserResponseDto {

    @ApiProperty({ description: 'User ID', example: 187877-7678-76788 })
    id: string;

    @ApiProperty({ description: 'User email address', example: 'john.doe@example.com' })
    email: string;

    @ApiProperty({ description: 'User first name', example: 'Ridwan' })
    firstName: string | null;

    @ApiProperty({ description: 'User last name', example: 'Abdulhammed' })
    lastName: string | null;

    @ApiProperty({ description: 'User role', enum: Role })
    role: string;

    @ApiProperty({ description: 'User account created date', example: '2023-01-01T00:00:00.000Z' })
    createdAt: Date;

    @ApiProperty({ description: 'User account updated date', example: '2023-01-01T00:00:00.000Z' })
    updatedAt: Date;
}