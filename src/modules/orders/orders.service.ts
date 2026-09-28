import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { OrderApiResponseDto, OrderResponseDto } from './dto/order-response.dto.js';
import { OrderStatus } from '../../generated/prisma/enums.js';
import { Order, OrderItem, Product, User } from '../../generated/prisma/client.js';
import { QueryOrderDto } from './dto/query-order.dto.js';
import { UpdateOrderDto } from './dto/update-order.dto.js';

@Injectable()
export class OrdersService {

    constructor(private readonly prisma: PrismaService) {}

    // Create Order endpoint .........................................................
    async create(userId: string, createdOrderDto: CreateOrderDto): Promise<OrderApiResponseDto<OrderResponseDto>> {
        const { items, shippingAddress } = createdOrderDto;

        for (const item of items) {
            const product = await this.prisma.product.findUnique({ where: { id: item.productId } });
            
            if (!product) {
                throw new NotFoundException(`Product with ID ${item.productId} not found`)
            }

            if (product.stock < item.quantity) {
                throw new BadRequestException(`Insufficient stock for product ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`)
            }
        }

        const total = items.reduce( (sum, item) => sum + item.price * item.quantity, 0);
        const latestCart = await this.prisma.cart.findFirst({ where: { userId, checkedOut: false }, orderBy: { createdAt: 'desc' } })
        const order = await this.prisma.$transaction( async(tx) => {

            const newOrder = await tx.order.create({ 
                data: { 
                    userId,
                    status: OrderStatus.PENDING,
                    totalAmount: total,
                    shippingAddress,
                    ...(latestCart && { cartId: latestCart.id }),
                }
            });

            for (const item of items) {
                await tx.orderItem.create({ 
                    data: { 
                        orderId: newOrder.id,
                        productId: item.productId,
                        quantity: item.quantity,
                        price: item.price
                    }
                });
            }

            return newOrder;
        });

        return this.wrap(order);
    }


    // Find all for admin endpoint .......................................................
    async findAllForAdmin(query: QueryOrderDto): Promise<{
        data: OrderResponseDto[];
        total: number;
        page: number;
        limit: number;
    }> {
       
        const { page=1, limit=10, status, search } = query;
        const skip = (page - 1) * limit;

        const where: any = {};
        if (status) where.statu = status;
        if (search) where.OR = [{ id: { contains: search, mode: 'insensitive' } }, { orderNumber: { contains: search, mode: 'insensitive' } }];
        
        const [ orders, total ] = await Promise.all([
            this.prisma.order.findMany({
                where,
                skip,
                take: limit,
                include: {
                    orderItems: {
                        include: { product: true }
                    },
                    user: true,
                },
                orderBy: { createdAt: 'desc' }
            }),

            this.prisma.order.count({ where })
        ]);

        return {
            data: orders.map((o)=> this.map(o)),
            total,
            page,
            limit
        }
    }

   
    // Find all order for current user ...................................................
    async findAll(userId: string, query: QueryOrderDto): Promise<{data: OrderResponseDto[]; total: number; page: number; limit: number }> {
        const { page=1, limit=10, status, search } = query;
        const skip = (page - 1) * limit;

        const where: any = { userId };
        if (status) where.status = status;
        if (search) where.OR = [{ id: { contains: search, mode: 'insensitive' } }, { orderNumber: { contains: search, mode: 'insensitive' } }];
        
        const [ orders, total ] = await Promise.all([
            this.prisma.order.findMany({
                where,
                skip,
                take: limit,
                include: {
                    orderItems: {
                        include: { product: true }
                    },
                    user: true,
                },
                orderBy: { createdAt: 'desc' }
            }),

            this.prisma.order.count({ where })
        ]);

        return {
            data: orders.map((o)=> this.map(o)),
            total,
            page,
            limit
        } 
    }


    // Admin find one endpoint ...........................................................
    async findOne(id: string, userId: string): Promise<OrderApiResponseDto<OrderResponseDto>> {
        const where: any = { id };
        if (userId) where.userId = userId;

        const order = await this.prisma.order.findFirst({
            where,
            include: {
                orderItems: {
                    include: { product: true }
                },
                user: true,
            }
        });

        if (!order) {
            throw new NotFoundException(`Order with ID ${id} not found`)
        }

        return this.wrap(order);
    }


    // Admin update order details .......................................................
    async update(id: string, updateOrderDto: UpdateOrderDto, userId?: string): Promise<OrderApiResponseDto<OrderResponseDto>> {
        const where: any = { id };
        if (userId) where.userId = userId;
        
        const existing = await this.prisma.order.findFirst({ where });
        if (!existing) {
            throw new NotFoundException(`Order with ID ${id} not found`)
        }

        const updated = await this.prisma.order.update({
            where: { id },
            data: updateOrderDto,
            include: {
                orderItems: {
                    include: { product: true }
                },
                user: true,
            }
        });

        return this.wrap(updated);
    }

    // Admin cancel order endpoint ......................................................
    async cancel(id: string, userId?: string): Promise<OrderApiResponseDto<OrderResponseDto>> {
        const where: any = { id };
        if (userId) where.userId = userId;

        const order = await this.prisma.order.findFirst({ 
            where,
            include: {
                orderItems: true,
                user: true,
            }
        });

        if (!order) {
            throw new NotFoundException(`Order with ID ${id} not found`)
        }

        if (order.status !== OrderStatus.PENDING) {
            throw new BadRequestException(`Only pending orders can be cancelled`)
        }

        const concelled = await this.prisma.$transaction(
            async (tx) => {
                for (const item of order.orderItems) {
                    await tx.product.update({
                        where: { id: item.productId },
                        data: { stock: { increment: item.quantity } }
                    });
                }

                return await tx.order.update({
                    where: { id },
                    data: { status: OrderStatus.CANCELLED },
                    include: {
                        orderItems: {
                            include: { product: true }
                        },
                        user: true,
                    }
                });
            }
        );

        return this.wrap(concelled);
    }


    // Private wrap function ..............................................................
    private wrap(
        order: Order & Partial<{
            orderItems: (OrderItem & { product: Product })[];
            user: User;
        }>
    ): OrderApiResponseDto<OrderResponseDto> {
        return {
            success: true,
            message: 'Order retreived successfully',
            data: this.map(order)
        }
    }

    // Private map function ..............................................................
    private map(
        order: Order & Partial<{
            orderItems: (OrderItem & { product: Product })[];
            user: User;
        }>,
    ): OrderResponseDto {
        return {
            id: order.id,
            userId: order.userId,
            status: order.status,
            total: Number(order.totalAmount),
            shippingAddress: order.shippingAddress ?? '',
            items: (order.orderItems ?? []).map((item) => ({
                id: item.id,
                productId: item.productId,
                productName: item.product?.name ?? '',
                quantity: item.quantity,
                price: Number(item.price),
                subTotal: Number(item.price) * item.quantity,
                createdAt: item.createdAt,
                updatedAt: item.updatedAt
            })),
            ...(order.user && {
                userEmail: order.user.email,
                userName: `${order.user.firstName || ''} ${order.user.lastName || ''}`.trim(),
            }),
            createdAt: order.createdAt,
            updatedAt: order.updatedAt
        }
    }

}
