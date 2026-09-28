import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsOptional } from "class-validator";

export class UpdateUserDto {

    @ApiProperty({ description: 'User email address', example: 'john.doe@example.com', required: false })
    @IsOptional()
    @IsEmail({}, { message: 'Please provide a valid email address' })
    email?: string;

    @ApiProperty({ description: 'User first name', example: 'Ridwan', required: false })
    @IsOptional()
    firstName: string;

    @ApiProperty({ description: 'User last name', example: 'Abdulhammed', required: false })
    @IsOptional()
    lastName: string;
}