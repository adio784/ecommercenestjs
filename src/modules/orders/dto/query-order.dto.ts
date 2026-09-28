import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import { IsBoolean, IsNumber, IsOptional, IsString, Min } from "class-validator";


export enum OrderStatus {
    PENDING = 'PENDING',
    PROCESSING = 'PROCESSING',
    SHIPPED = 'SHIPPED',
    DELIVERED = 'DELIVERED',
    CANCELLED = 'cancelled'

}
export class QueryOrderDto {
    
    @IsOptional()
    @Type(() => Number)
    page?: number = 1;


    @IsOptional()
    limit?: number = 10;


    @IsOptional()
    @Type(()=> Number)
    status?: number

    @IsOptional()
    @IsString()
    search?: string

   
}