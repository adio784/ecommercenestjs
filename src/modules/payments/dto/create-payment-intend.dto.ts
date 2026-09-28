import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreatePaymentIntentDto {
    
    @IsNotEmpty()
    @IsString()
    orderId: string
    
    @IsNotEmpty()
    @IsNumber()
    amount: number

    @IsOptional()
    @IsString()
    currency?: string

    @IsOptional()
    @IsString()
    description?: string

    
}