import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import { IsBoolean, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class QueryProductDto {
    @ApiPropertyOptional({ description: 'Filer by category', example: 'Electronics' })
    @IsString()
    @IsOptional()
    category?: string


    @ApiPropertyOptional({ description: 'Filer by active status', example: true })
    @Transform(({ value }) => {
        if (value === 'true' || value === 'false') return true
        if (value === 'false' || value === 'false') return false
    })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean


    @ApiPropertyOptional({ description: 'Search by product name', example: 'earpod-buzz' })
    @IsOptional()
    @IsString()
    search?: string

    @ApiPropertyOptional({ description: 'Page number for pagination', example: 1, default: 1, minimum: 1 })
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    @IsOptional()
    page = 1

    @ApiPropertyOptional({ description: 'Number of Items per page for pagination', example: 1, default: 1, minimum: 1 })
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    @IsOptional()
    limit = 1
}