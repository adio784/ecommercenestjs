import { IsNotEmpty, IsNumber, IsString } from "class-validator"

export class createPaymentDto {
    @IsNotEmpty()
    @IsString()
    paymentIntentId: string

    @IsNotEmpty()
    @IsString()
    orderId: string

}