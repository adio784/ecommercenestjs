import { ApiProperty, PartialType } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";
import { CreateCategoryDto } from "./create-category.dto.js";


export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}