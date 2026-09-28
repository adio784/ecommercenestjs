import { ApiProperty, PartialType } from "@nestjs/swagger";
import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";
import { CreateOrderDto } from "./create-order.dto.js";
import { OrderStatus } from "../../../generated/prisma/enums.js";



export class UpdateOrderDto {

    @IsOptional()
    @IsEnum(OrderStatus)
    status?: OrderStatus

    @IsOptional()
    @IsString()
    trackingNumber?: string

    @IsOptional()
    @IsString()
    note?: string
}