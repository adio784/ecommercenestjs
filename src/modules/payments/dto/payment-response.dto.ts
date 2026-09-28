import { ApiProperty } from "@nestjs/swagger";


export class PaymentResponseDto {
    @ApiProperty({ description: 'The unique identifier of the payment', example: '494898-98788e987-39890' })
    id: string    

    @ApiProperty({ description: 'The unique identifier of the order', example: 'order-1234' })
    orderId: string

    @ApiProperty({ example: 99.99 })
    amount: string

    @ApiProperty({ example: 'user-1234' })
    userId: string

    @ApiProperty({ example: 'USD'})
    currency: string

    @ApiProperty({ example: 'COMPLETED', enum: ['PENDING', 'COMPLETED', 'FAILED'] })
    status: string

    @ApiProperty({ example: 'STRIPE', nullable: true })
    paymentMethod: string | null  
    
    @ApiProperty({ example: '78797972718979', nullable: true })
    transactionId: string

    @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
    createdAt: Date

    @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
    updatedAt: Date
}


export class CreatePaymentIntendResponseDto {
    @ApiProperty({  example: true})
    success: boolean

    @ApiProperty({ description: 'The client secret key', example: 'sk_test_1234567890' })
    clientSecrete : string

    @ApiProperty({ description: 'The unique identifier of the payment in DB', example: '494898-98788e987-39890' })
    paymentId: string

    @ApiProperty({ type: CreatePaymentIntendResponseDto })
    data: CreatePaymentIntendResponseDto

    @ApiProperty({ example: 'Payment intent created successfully', required: false })
    message?: string

}


export class PaymentApiResponseDto {
    @ApiProperty({ description: 'Indicates if the request was successful', example: true })
    success: boolean;

    @ApiProperty({ type: PaymentResponseDto, description: 'Return Data' })
    data: PaymentResponseDto

    @ApiProperty({ example: 'Payment retrieved successfully', required: false })
    message?: string
}

