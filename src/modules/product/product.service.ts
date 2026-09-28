import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { Category, Prisma, Product } from '../../generated/prisma/client.js';
import { ProductResponseDto } from './dto/product-response.dto.js';
import { QueryProductDto } from './dto/query-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';

@Injectable()
export class ProductService {

    constructor(private prisma: PrismaService) {}

    // Create product endpoint ........................................................
    async create(createProductDto: CreateProductDto): Promise<ProductResponseDto> {

        // check if product already exist
        const existingProduct = await this.prisma.product.findUnique({
            where: { sku: createProductDto.sku }
        });

        if (existingProduct) {
            throw new ConflictException(`Product with SKU code ${createProductDto.sku} has already been taken`)
        }

        const product = await this.prisma.product.create({
            data: {
                ...createProductDto,
                price: new Prisma.Decimal(createProductDto.price)
            },
            include: {
                category: true
            }
        });

        return this.formatProduct(product);
    }


    // Function to format procduct ...................................................
    private formatProduct(product: Product & { category: Category }): ProductResponseDto {
        return {
            ...product,
            price: Number(product.price),
            category: product.category.name
        }
    }

    // Find all products endpoint .......................................................
    async findAll(queryDto: QueryProductDto): Promise<{data: ProductResponseDto[], meta: { total: number; page: number; limit: number; totalPages: number }}> {
        const { category, isActive, search, page=1, limit=10 } = queryDto;
        const where: Prisma.ProductWhereInput = {};

        if (category) {
            where.categoryId = category
        }

        if (isActive !== undefined) {
            where.isActive = isActive;
        }

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }

        const total = await this.prisma.product.count({ where });
        const products = await this.prisma.product.findMany({
            where,
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: { category: true }
        });

        return {
            data: products.map((product) =>
                this.formatProduct(product)
            ),
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            }
        }
    }


    // Find one product endpoint by ID ..................................................
    async findOne(id: string): Promise<ProductResponseDto> {
        const product = await this.prisma.product.findUnique({ where: { id }, include:{category: true} });
        if (!product) {
            throw new Error(`Product with id ${id} not found`);
        }
        return await this.formatProduct(product);
    }


    // Update product by ID ................................................
    async update(id: string, updateProductDto: UpdateProductDto): Promise<ProductResponseDto> {
        const existingProduct = await this.prisma.product.findUnique({ where: { id } });
        
        if (!existingProduct) {
            throw new NotFoundException(`Product with id ${id} not found`);
        }

        if (updateProductDto && updateProductDto.sku !== existingProduct.sku) {
            const skuTaken = await this.prisma.product.findUnique({ where: { sku: updateProductDto.sku } });
            if (skuTaken) {
                throw new ConflictException(`Product with SKU code ${updateProductDto.sku} already exists`);
            }
        }
        const updateData: any = { ...updateProductDto }; 
        if (updateProductDto && updateProductDto.price !== undefined) {
            updateData.price = new Prisma.Decimal(updateProductDto.price)
        }

        const updatedProduct = await this.prisma.product.update({
            where: { id },
            data: updateData,
            include: {
                category: true
            }
        })
        return await this.formatProduct (updatedProduct);
    }


    // Update stock ............................................................
    async updateStock(id: string, quantity: number): Promise<ProductResponseDto> {
        const product = await this.prisma.product.findUnique({ where: { id } });
        
        if (!product) {
            throw new NotFoundException(`Product not found`);
        }

        const newStock = product.stock + quantity; 

        if (newStock < 0) {
            throw new BadRequestException('Insufficient stock')
        }

        const updatedProduct = await this.prisma.product.update({
            where: { id },
            data: { stock: newStock },
            include: {
                category: true
            }
        })
        return await this.formatProduct (updatedProduct);
    }

    
    // Remote product ..........................................................
    async remove(id: string): Promise<{ message: string}> {
        const product = await this.prisma.product.findUnique({ 
            where: { id },
            include:{ orderItems: true, cartItem: true }
        });
        if (!product) {
            throw new NotFoundException(`Product not found`);
        }
        
        if (product.orderItems.length > 0) {
            throw new BadRequestException(`Cannot delete product that is part of orders. Consider marking it as inactive`);
        }
       
        await this.prisma.product.delete({ where: { id } });
        return { message: `Product with id ${id} deleted successfully` };
    }

    


}
