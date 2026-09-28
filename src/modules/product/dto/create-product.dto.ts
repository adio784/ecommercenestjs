import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, Min } from "class-validator";


export class CreateProductDto {

    @ApiProperty({ description: 'Product name', example: 'Earpod Buz', maxLength: 200 })
    @IsString()
    @IsNotEmpty()
    @MaxLength(200)
    name: string;

    @ApiProperty({ description: 'Product description', example: 'High-end quality voice, with noice cancleation', required: false, maxLength: 1000 })
    @IsString()
    @IsOptional()
    @MaxLength(1000)
    description: string;

    @ApiProperty({ description: 'Product price in USD', example: 29.99, minimum:0 })
    @IsNumber({ maxDecimalPlaces: 2, })
    @Min(0)
    @Type(()=> Number)
    price: number;


    @ApiProperty({ description: 'Stock Quantity', example: 100, minimum:0 })
    @IsNumber()
    @Min(0)
    @Type(()=> Number)
    stock: number;

    @ApiProperty({ description: 'Stock Keeping Unit (Sku) - unique identifier', example: 'WHU-001', maxLength:50 })
    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    sku: string;

    @ApiProperty({ description: 'Product image url', example: 'https://example.com/images/electronics.png', required: false })
    @IsString()
    @IsOptional()
    imageUrl: string;

    @ApiProperty({ description: 'Product Category', example: 'Electronics', required: true })
    @IsString()
    @IsOptional()
    categoryId: string;


    @ApiProperty({ description: 'Product status whether active available for purchase or not', example: true, required: false, default: true })
    @IsBoolean()
    @IsOptional()
    isActive: boolean;
}