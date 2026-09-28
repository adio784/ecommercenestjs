import { ApiOperation, ApiProperty } from "@nestjs/swagger";
import { Role } from "../../../generated/prisma/enums.js";
import { IsNotEmpty, IsString, Matches, MinLength } from "class-validator";

export class ChangePasswordDto {
    @ApiProperty({ description: 'User Old/Current password', example: 'password' })
    @IsString()
    @IsNotEmpty({ message: 'Current password is required' })
    currentPassword: string;


    @ApiProperty({ description: 'User new password', example: 'password', minLength: 8 })
    @IsString()
    @IsNotEmpty({ message: 'New password is required' })
    @MinLength(8, {message: 'Password must be at least 8 characters long' })
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,{message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'})
    newPassword: string;
}