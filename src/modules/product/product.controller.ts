import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProductService } from './product.service.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { ProductResponseDto } from './dto/product-response.dto.js';
import { QueryProductDto } from './dto/query-product.dto.js';
import { PageDto } from '../category/dto/page.dto.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { Role } from '../../generated/prisma/enums.js';
import { UpdateProductDto } from './dto/update-product.dto.js';


@ApiTags('product')
@Controller('product')
export class ProductController {

    constructor(private readonly productService: ProductService){}

    // Create product
    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Create a new product (Admin only)'})
    @ApiBody({ type: CreateProductDto })
    @ApiResponse({ status:201, description: 'Product created successfully', type: ProductResponseDto })
    @ApiResponse({ status:409, description: 'Sku code already exist' })
    @ApiResponse({ status:403, description: 'Forbidden - Admin role required' })
    async create(@Body() createProductDto: CreateProductDto): Promise<ProductResponseDto> {
        return await this.productService.create(createProductDto);
    }

    // Get all products 
    @Get()
    @ApiOperation({ summary: 'Get all products with optional filters' })
    @ApiResponse({ 
        status: 200, 
        description: 'List all products with pagination', 
        schema: { 
            type: 'object', 
            properties: {
                data: { 
                    type: 'array',
                    items: { $ref: '#/components/schemas/ProductResponseDto' } 
                },
                meta: { 
                    type: 'object', 
                    properties: {
                        total: {type: 'number'},
                        page: {type: 'number'},
                        limit: {type: 'number '},
                        totalPage: {type: 'number'}
                    } 
                } 
            }
        },
        
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    async findAll(@Query() queryDto: QueryProductDto): Promise<PageDto<ProductResponseDto>> {
        return await this.productService.findAll(queryDto);
    }


    // Get product by ID
    @Get(':id')
    @ApiOperation({ summary: 'Get product by ID' })
    @ApiResponse({ status: 200, description: 'Product retrieved successfully', type: ProductResponseDto })
    @ApiResponse({ status: 404, description: 'Product not found' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    async findCategory(@Param('id') id: string): Promise<ProductResponseDto> {
        return await this.productService.findOne(id); 
    }


    // Update product
    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @ApiBearerAuth('JWT-auth')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Update product stock (Admin only)' })
    @ApiBody({ type: UpdateProductDto })         
    @ApiResponse({ status: 200, description: 'Product updated' })
    @ApiResponse({ status: 400, description: 'Invalid Input Data' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    async update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto): Promise<ProductResponseDto> {
        return await this.productService.update(id, updateProductDto);
    }


    // Update product stock
    @Patch(':id/stock')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @ApiBearerAuth('JWT-auth')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Update product (Admin only)' })
    @ApiBody({ schema: {
        type: "object",
        properties: {
            quantity: {
                type: "number",
                description: "Stock adjustment (positive to add, negative to subtract)",
                example: 10
            }
        },
        required: ['quantity']
    } })         
    @ApiResponse({ status: 200, description: 'Stock updated successfully', type: UpdateProductDto })
    @ApiResponse({ status: 400, description: 'Insufficient stock' })
    @ApiResponse({ status: 404, description: 'Product not found' })
    async updateStock(@Param('id') id: string, @Body('quantity') quantity: number): Promise<ProductResponseDto> {
        return await this.productService.updateStock(id, quantity);
    }


    // Delete product 
    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @ApiBearerAuth('JWT-auth')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Delete product (Admin only)' })
    @ApiResponse({ status: 200, description: 'Product deleted successfully' })
    @ApiResponse({ status: 400, description: 'Cannot delete product in active order' })
    @ApiResponse({ status: 404, description: 'Product not found' })
    async remove(@Param('id') id: string): Promise<{ message: string}> {
        return await this.productService.remove(id);
    }




}
