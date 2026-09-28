import { Body, Controller, Delete, Get, Post, HttpCode, HttpStatus, Param, Patch, Req, UseGuards, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiProperty, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { CategoryService } from './category.service.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { Role } from '../../generated/prisma/enums.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { CategoryResponseDto } from './dto/category-response.dto.js';
import { QueryCategoryDto } from './dto/query-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';
import { PageDto } from './dto/page.dto.js';


@ApiTags('category')
@ApiBearerAuth('JWT-Auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('category')
export class CategoryController {

    constructor(private readonly categoryService: CategoryService) {}
    
    
        // Create a new category (for admin only)
        @Post()
        @UseGuards(JwtAuthGuard, RolesGuard)
        @Roles(Role.ADMIN)
        @ApiBearerAuth('JWT-Auth')
        @HttpCode(HttpStatus.CREATED)
        @ApiOperation({ summary: 'Create new category (for admin only)' })
        @ApiBody({ type: CreateCategoryDto })         
        @ApiResponse({ status: 200, description: 'Category created' })
        @ApiResponse({ status: 400, description: 'Invalid Input Data' })
        @ApiResponse({ status: 401, description: 'Unauthorized' })
        @ApiResponse({ status: 403, description: 'Forbidden' })
        async create(@Body() createCategoryDto: CreateCategoryDto): Promise<CategoryResponseDto> {
            return await this.categoryService.create(createCategoryDto);
        }



        // Get all categories 
        @Get()
        @ApiOperation({ summary: 'Get all categories' })
        @ApiResponse({ 
            status: 200, 
            description: 'Categories retrieved successfully', 
            schema: { 
                type: 'object', 
                properties: {
                    data: { 
                        type: 'array',
                        items: { $ref: '#/components/schemas/CategoryResponseDto' } 
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
        async findAll(@Query() queryDto: QueryCategoryDto): Promise<PageDto<CategoryResponseDto>> {
            return await this.categoryService.findAll(queryDto);
        }
        

        // Get category by ID
        @Get(':id')
        @ApiOperation({ summary: 'Get category by ID' })
        @ApiResponse({ status: 200, description: 'Category retrieved successfully', type: CategoryResponseDto })
        @ApiResponse({ status: 404, description: 'Category not found' })
        @ApiResponse({ status: 401, description: 'Unauthorized' })
        @ApiResponse({ status: 403, description: 'Forbidden' })
        async findCategory(@Param('id') id: string): Promise<CategoryResponseDto> {
           return await this.categoryService.findCategory(id); 
        }


        // Get category by slug
        @Get('slug/:slug')
        @ApiOperation({ summary: 'Get category by slug' })
        @ApiResponse({ status: 200, description: 'Category retrieved successfully', type: CategoryResponseDto })
        @ApiResponse({ status: 404, description: 'Category not found' })
        @ApiResponse({ status: 401, description: 'Unauthorized' })
        @ApiResponse({ status: 403, description: 'Forbidden' })
        async findCategoryBySlug(@Param('slug') slug: string): Promise<CategoryResponseDto> {
           return await this.categoryService.findCategoryBySlug(slug); 
        }


        // Update category (Admin only)
        @Patch(':id')
        @UseGuards(JwtAuthGuard, RolesGuard)
        @Roles(Role.ADMIN)
        @ApiBearerAuth('JWT-auth')
        @HttpCode(HttpStatus.OK)
        @ApiOperation({ summary: 'Update category (Admin only)' })
        @ApiBody({ type: UpdateCategoryDto })         
        @ApiResponse({ status: 200, description: 'Category updated' })
        @ApiResponse({ status: 400, description: 'Invalid Input Data' })
        @ApiResponse({ status: 401, description: 'Unauthorized' })
        @ApiResponse({ status: 403, description: 'Forbidden' })
        async update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto): Promise<CategoryResponseDto> {
            return await this.categoryService.update(id, updateCategoryDto);
        }


        // Delete category 
        @Delete(':id')
        @UseGuards(JwtAuthGuard, RolesGuard)
        @Roles(Role.ADMIN)
        @ApiBearerAuth('JWT-auth')
        @HttpCode(HttpStatus.OK)
        @ApiOperation({ summary: 'Delete category (Admin only)' })
        @ApiResponse({ status: 200, description: 'Category deleted' })
        @ApiResponse({ status: 401, description: 'Unauthorized' })
        @ApiResponse({ status: 403, description: 'Forbidden' })
        async remove(@Param('id') id: string): Promise<{ message: string}> {
            return await this.categoryService.remove(id);
        }
       
}
