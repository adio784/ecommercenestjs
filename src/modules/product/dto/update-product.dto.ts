import { ApiProperty, PartialType } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";
import { CreateProductDto } from "./create-product.dto.js";



export class UpdateProductDto extends PartialType(CreateProductDto) {}