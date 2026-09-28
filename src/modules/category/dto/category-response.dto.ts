import { ApiProperty } from "@nestjs/swagger";


export class CategoryResponseDto {
    @ApiProperty({ example: '494898-98788e987-39890', description: 'The unique identifier of the category' })
    id: string

    @ApiProperty({ example: 'Electronics', description: 'The name of the category' })
    name: string

    @ApiProperty({ example: 'Gadget and Electronical devices charger etc', description: 'A brief description of the category' })
    description: string | null

    @ApiProperty({ example: 'electronics', description: 'The URL-friendly slug for the catgeory' })
    slug: string | null

    @ApiProperty({ example: 'https://example.com/images/electronics.png', description: 'URL of the category image', nullable: true })
    imageUrl: string | null

    @ApiProperty({ example: true, description: 'Indicates if the category is active' })
    isActive: boolean

    @ApiProperty({ example: 150, description: 'Number of product in each category' })
    productCount: number

    @ApiProperty({ example: '2026-09-27T12:00:00Z', description: 'Date and time each category is been created' })
    createdAt: Date

    @ApiProperty({ example: '2026-09-27T12:00:00Z', description: 'Date and time each category is been updated' })
    updatedAt: Date
}