import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBearerAuth, ApiBody, ApiCreatedResponse, ApiForbiddenResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags, ApiTooManyRequestsResponse, getSchemaPath } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { OrdersService } from './orders.service.js';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { OrderApiResponseDto, OrderResponseDto, PaginatedOrderResponseDto } from './dto/order-response.dto.js';
import { GetUser } from '../../common/decorators/get-user.decorator.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { Role } from '../../generated/prisma/enums.js';
import { RelaxedThrottle } from '../../common/decorators/custom-throttler.decorator.js';
import { QueryOrderDto } from './dto/query-order.dto.js';
import { UpdateOrderDto } from './dto/update-order.dto.js';

@ApiTags('orders')
@ApiBearerAuth('JWT-auth')
@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {

    constructor(private readonly ordersService: OrdersService) {}


    // Create orders
    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Create a new order'})
    @ApiBody({ type: CreateOrderDto })
    @ApiCreatedResponse({ description: 'Order created successfully', type: OrderResponseDto })
    @ApiBadRequestResponse({ description: 'Invalid data or inufficient stock' })
    @ApiNotFoundResponse({ description: 'Cart not found or empty' })
    @ApiTooManyRequestsResponse({ description: 'Too many request - rate limit exceeded' })
    async create(@Body() createOrderDto: CreateOrderDto, @GetUser('id') userId: string){
        return await this.ordersService.create(userId, createOrderDto);
    }


    // Get all orders 
    @Get('admin/all')
    @Roles(Role.ADMIN)
    @RelaxedThrottle()
    @ApiOperation({ summary: '[ADMIN] Get all orders (paginated)' })
    @ApiQuery({ name: 'status', required: false, type: String })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiResponse({ 
        status: 200, 
        description: 'List all orders with pagination', 
        schema: { 
            type: 'object',
            properties: { 
                data: { 
                    type: 'array', 
                    items: { $ref: getSchemaPath(OrderResponseDto) }, 
                },
                total: { type: 'number' }, 
                page: { type: 'number' }, 
                limit: { type: 'Nnumber' } 
            } 
        } 
    })
    @ApiForbiddenResponse({ description: 'Admin access only' })
    async findAllForAdmin(@Query() queryDto: QueryOrderDto) {
        return await this.ordersService.findAllForAdmin(queryDto);
    }


    // User get own order
    @Get()
    @RelaxedThrottle()
    @ApiOperation({ summary: 'Get order for current user (paginated)' })
    @ApiQuery({ name: 'status', required: false, type: String })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiOkResponse({ description: 'List of user orders with pagination', type: PaginatedOrderResponseDto })
    async findAll(@Query() query: QueryOrderDto, @GetUser('id') userId: string) {
        return await this.ordersService.findAll(userId, query);
    }


    // ADMIN: Get order by ID
    @Get('admin/:id')
    @Roles(Role.ADMIN)
    @RelaxedThrottle()
    @ApiOperation({ summary: '[ADMIN] Get order by ID' })
    @ApiParam({ name: 'id', description: 'Order ID' })
    @ApiOkResponse({ description: 'Order details', type: OrderApiResponseDto })
    @ApiForbiddenResponse({ description: 'Admin access only' })
    async findOneAdmin(@Param('id') id: string, @GetUser('id') userId: string) {
        return await this.ordersService.findOne(id, userId);
    }


    // User: Get own order by id
    @Get(':id')
    @RelaxedThrottle()
    @ApiOperation({ summary: 'Get order by ID for current user' })
    @ApiParam({ name: 'id', description: 'Order ID' })
    @ApiOkResponse({ description: 'Order details', type: OrderApiResponseDto })
    @ApiNotFoundResponse({ description: 'Order not found' })
    async findOne(@Param('id') id: string, @GetUser('id') userId: string) {
        return await this.ordersService.findOne(id, userId);
    }


    // ADMIN: Update order record 
    @Post('admin/:id')
    @Roles(Role.ADMIN)
    @RelaxedThrottle()
    @ApiOperation({ summary: '[ADMIN] Update order record' })
    @ApiParam({ name: 'id', description: 'Order ID' })
    @ApiBody({ type: UpdateOrderDto })
    @ApiOkResponse({ description: 'Order updated successfully', type: OrderApiResponseDto })
    @ApiNotFoundResponse({ description: 'Order not found' })
    @ApiForbiddenResponse({ description: 'Admin access only' })
    async updateAdmin(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
        return await this.ordersService.update(id, updateOrderDto);
    }

    // USER: Update own order record 
    @Post('admin/:id')
    @Roles(Role.USER)
    @RelaxedThrottle()
    @ApiOperation({ summary: 'Update your own order record' })
    @ApiParam({ name: 'id', description: 'Order ID' })
    @ApiBody({ type: UpdateOrderDto })
    @ApiOkResponse({ description: 'Order updated successfully', type: OrderApiResponseDto })
    @ApiNotFoundResponse({ description: 'Order not found' })
    async update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto, @GetUser('id') userId: string) {
        return await this.ordersService.update(id, updateOrderDto, userId);
    }


    // ADMIN: Cancel an order
    @Delete('admin/:id')
    @Roles(Role.ADMIN)
    @RelaxedThrottle()
    @ApiOperation({ summary: '[ADMIN] cancel order' })
    @ApiParam({ name: 'id', description: 'Order ID' })
    @ApiBody({ type: UpdateOrderDto })
    @ApiOkResponse({ description: 'Order cancled successfully', type: OrderApiResponseDto })
    @ApiNotFoundResponse({ description: 'Order not found' })
    @ApiForbiddenResponse({ description: 'Admin access only' })
    async cancelAdmin(@Param('id') id: string) {
        return await this.ordersService.cancel(id);
    }

    // User cancel an order 
    @Delete(':id')
    @RelaxedThrottle()
    @ApiOperation({ summary: 'Cancel your own order' })
    @ApiParam({ name: 'id', description: 'Order ID' })
    @ApiBody({ type: UpdateOrderDto })
    @ApiOkResponse({ description: 'Order cancled successfully', type: OrderApiResponseDto })
    @ApiNotFoundResponse({ description: 'Order not found' })
    async cancel(@Param('id') id: string, @GetUser('id') userId: string) {
        return await this.ordersService.cancel(id, userId);
    }




}
