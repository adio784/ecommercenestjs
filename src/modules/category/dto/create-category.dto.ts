import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";


export class CreateCategoryDto {

    @ApiProperty({ description: 'Category name', example: 'Example', maxLength: 100 })
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    name: string;

    @ApiProperty({ description: 'Category description', example: 'Device and accessories including phones, tablets, laptops, accessories, etc.', required: false, maxLength: 1000 })
    @IsString()
    @IsNotEmpty()
    @MaxLength(1000)
    description: string;

    @ApiProperty({ description: 'Category slug', example: 'itel-charger', required: false })
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    slug: string;

    @ApiProperty({ description: 'Category image', example: 'https://example.com/images/electronics.png', required: false, maxLength: 255 })
    @IsString()
    @IsOptional()
    @IsNotEmpty()
    @MaxLength(255)
    imageUrl: string;

    @ApiProperty({ description: 'Indicate category is active', example: true, required: false, default: true })
    @IsOptional()
    @IsBoolean()
    isActive: boolean;
}