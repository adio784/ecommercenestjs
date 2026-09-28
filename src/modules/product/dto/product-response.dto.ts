import { ApiProperty } from "@nestjs/swagger";


export class ProductResponseDto {
    @ApiProperty({ example: '494898-98788e987-39890', description: 'Product ID' })
    id: string;

    @ApiProperty({ example: 'Earpod-Buzz', description: 'Product name' })
    name: string;

    @ApiProperty({ example: 'Wireless quality earpod buzz with noize cancleation', description: 'A brief description of the product' })
    description: string | null

    @ApiProperty({ example: 99.99, description: 'Product price' })
    price: number;

    @ApiProperty({ example: 100, description: 'Product stock' })
    stock: number;


    @ApiProperty({ example: 'WHU-009', description: 'Stock keeping unit' })
    sku: string;

    @ApiProperty({ example: 'https://example.com/images/electronics.png', description: 'URL of the product image', nullable: true })
    imageUrl: string | null;

    @ApiProperty({ example: 'Electronic', description: 'Product category' })
    category: string | null;

    @ApiProperty({ example: true, description: 'Product visibility' })
    isActive: boolean;


    @ApiProperty({ example: '2026-09-27T12:00:00Z', description: 'Date and time each product is been created' })
    createdAt: Date;

    @ApiProperty({ example: '2026-09-27T12:00:00Z', description: 'Date and time each product is been updated' })
    updatedAt: Date;
}