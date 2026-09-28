import { ApiProperty } from "@nestjs/swagger";


export class OrderApiResponseDto<T> {
    @ApiProperty({ description: 'Indicates if the request was successful' })
    success: boolean;

    @ApiProperty({ type: Object, description: 'Return Data' })
    data: T;

    @ApiProperty({ nullable: true, required: false, description: 'Optional messssage' })
    message: string | null

}



export class OrderItemResponseDto {
    @ApiProperty()
    id: string

    @ApiProperty()
    productId: string

    @ApiProperty()
    productName: string

    @ApiProperty()
    quantity: number

    @ApiProperty()
    price: number

    @ApiProperty()
    subTotal: number

    @ApiProperty()
    createdAt: Date

    @ApiProperty()
    updatedAt: Date
}



export class OrderResponseDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    userId: string;

    @ApiProperty()
    status: string;

    @ApiProperty()
    total: number;

    @ApiProperty()
    shippingAddress: string;

    @ApiProperty({ type: [OrderItemResponseDto] })
    items: OrderItemResponseDto[]

    @ApiProperty()
    createdAt: Date

    @ApiProperty()
    updatedAt: Date
}

export class PaginatedOrderResponseDto {
    @ApiProperty({ type: [OrderResponseDto] })
    data: OrderResponseDto[]

    @ApiProperty()
    total: number

    @ApiProperty()
    page: number

    @ApiProperty()
    limit: number
}