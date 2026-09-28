import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, Min, ValidateNested } from "class-validator";


export class CreateOrderDto {

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    productId: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    quantity: number;

    @ApiProperty({ example: 29.99 })
    @IsNumber({ maxDecimalPlaces: 2},{ message: 'Price must have 2 decimal places' })
    @Type(()=> Number)
    price: number;


    @ApiProperty({ type: [CreateOrderDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(()=> CreateOrderDto)
    items: CreateOrderDto[];

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    shippingAddress: string;

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