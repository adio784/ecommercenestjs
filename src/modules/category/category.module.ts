import { Module } from '@nestjs/common';
import { CategoryService } from './category.service.js';
import { CategoryController } from './category.controller.js';

@Module({
  providers: [CategoryService],
  controllers: [CategoryController]
})
export class CategoryModule {}
