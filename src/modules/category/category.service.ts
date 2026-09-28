import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CategoryResponseDto } from './dto/category-response.dto.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { Category, Prisma } from '../../generated/prisma/client.js';
import { QueryCategoryDto } from './dto/query-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';

@Injectable()
export class CategoryService {

    constructor(private prisma: PrismaService) {}

    // create category endpoint ............................................
    async create(createCategoryDto: CreateCategoryDto): Promise<CategoryResponseDto> {
        const { name, slug, ...rest } = createCategoryDto;
        const categorySlug = slug ?? name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
        const existingCategory = await this.prisma.category.findUnique({ where: { slug: categorySlug } });

        if (existingCategory) {
            throw new Error(`Category with slug ${categorySlug} already exists`);
        }
        const category = await this.prisma.category.create({ 
            data: { 
                name, slug: 
                categorySlug, 
                ...rest 
            } 
        });
        return await this.formatCategory(category, 0);
    }


    // Find all categories endpoint ........................................
    async findAll(queryDto: QueryCategoryDto): Promise<{data: CategoryResponseDto[], meta: { total: number; page: number; limit: number; totalPages: number }}> {
        const { isActive, search, page=1, limit=10 } = queryDto;
        const where: Prisma.CategoryWhereInput = {};

        if (isActive !== undefined) {
            where.isActive = isActive;
        }

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }

        const total = await this.prisma.category.count({ where });
        const categories = await this.prisma.category.findMany({
            where,
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: { products: true }
                }
            }
        });

        return {
            data: categories.map((category) =>
                this.formatCategory(category, category._count.products)
            ),
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            }
        }
    }


    // Find category by ID ..................................................
    async findCategory(id: string): Promise<CategoryResponseDto> {
        const category = await this.prisma.category.findUnique({ where: { id }, include:{_count:{select:{ products: true}}} });
        if (!category) {
            throw new Error(`Category with id ${id} not found`);
        }
        return await this.formatCategory(category, Number(category._count.products));
    }


    // Find Category by slug ................................................
    async findCategoryBySlug(slug: string): Promise<CategoryResponseDto> {
        const category = await this.prisma.category.findUnique({ where: { slug }, include:{_count:{select:{ products: true}}} });
        if (!category) {
            throw new Error(`Category with slug ${slug} not found`);
        }
        return await this.formatCategory(category, Number(category._count.products));
    }


    // Update category by ID ................................................
    async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<CategoryResponseDto> {
        const existingcategory = await this.prisma.category.findUnique({ where: { id } });
        
        if (!existingcategory) {
            throw new NotFoundException(`Category with id ${id} not found`);
        }

        if (updateCategoryDto.slug && updateCategoryDto.slug !== existingcategory.slug) {
            const slugTaken = await this.prisma.category.findUnique({ where: { slug: updateCategoryDto.slug } });
            if (slugTaken) {
                throw new ConflictException(`Category with slug ${updateCategoryDto.slug} already exists`);
            }
        }
        const updateCategory = await this.prisma.category.update({ 
            where: { id }, 
            data: updateCategoryDto,
            include:{_count:{select:{ products: true}}}
        });  
        return await this.formatCategory(updateCategory, Number(updateCategory._count.products));
    }


    // Delete category by ID ................................................
    async remove(id: string): Promise<{ message: string}> {
        const category = await this.prisma.category.findUnique({ 
            where: { id },
            include:{_count:{select:{ products: true}}}
        });
        if (!category) {
            throw new NotFoundException(`Category with id ${id} not found`);
        }
        
        if (category._count.products > 0) {
            throw new BadRequestException(`Category with id ${id} has associated products and cannot be deleted. Remove or Reassign first`);
        }
       
        await this.prisma.category.delete({ where: { id } });
        return { message: `Category with id ${id} deleted successfully` };
    }


    // format category method ...............................................
    private formatCategory(category: Category, productCount: number): CategoryResponseDto {
        return {
            id: category.id,
            name: category.name,
            slug: category.slug,
            description: category.description,
            imageUrl: category.imageUrl,
            isActive: category.isActive,
            productCount,
            createdAt: category.createdAt,
            updatedAt: category.updatedAt,
        };
    }



}
