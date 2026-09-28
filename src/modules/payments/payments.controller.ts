import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { ApiBadRequestResponse, ApiBearerAuth, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, ApiProperty, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PaymentsService } from './payments.service.js';
import { CreatePaymentIntendResponseDto, PaymentApiResponseDto } from './dto/payment-response.dto.js';
import { CreatePaymentIntentDto } from './dto/create-payment-intend.dto.js';
import { GetUser } from '../../common/decorators/get-user.decorator.js';
import { createPaymentDto } from './dto/create-payment.dto.js';

@Controller('payments')
@UseGuards(JwtAuthGuard)
@ApiTags('payments')
@ApiBearerAuth()
export class PaymentsController {

    constructor(private readonly paymentsService: PaymentsService) {}

    // Create payment intent
    @Post('create-intent')
    @ApiOperation({ summary: 'Create a payment intent', description: 'Create a payment intent' })
    @ApiCreatedResponse({ description: 'Payment intent created', type:CreatePaymentIntendResponseDto })
    @ApiBadRequestResponse({ description: 'Invalid data or order not found' })
    async createPaymentIntent(@Body() createPaymentIntentDto: CreatePaymentIntentDto, @GetUser('id') userId: string) {
        return this.paymentsService.createPaymentIntent(userId, createPaymentIntentDto);
    }


    // Confirm payment
    @Post('confirm-payment')
    @ApiOperation({ summary: 'Confirm payment', description: 'Confirm a payment intent for an order' })
    @ApiResponse({ description: 'Payment confirmed', type:PaymentApiResponseDto })
    @ApiBadRequestResponse({ description: 'Invalid data or payment not found' })
    async confirmPayment(@Body() createPaymentDto: createPaymentDto, @GetUser('id') userId: string) {
        return this.paymentsService.confirmPayment(userId, createPaymentDto);
    }


    // Find all payments
    @Get()
    @ApiResponse({ summary:'Get all payments', description: 'Get all payments for the current user' })
    @ApiOkResponse({ description: 'Payment retrieved successfully', type: PaymentApiResponseDto })
    @ApiBadRequestResponse({ description: 'Invalid data or payment not found' })
    async findAll(@GetUser('id') userId: string) {
        return this.paymentsService.findAll(userId);
    }

    // Find a single payment
    @Get(':id')
    @ApiParam({ name:'id', description:'Payment ID', example:'88783-2253-32432342' })
    @ApiOperation({ summary: 'Get payment by ID', description: 'Get a specific payment by ID'})
    @ApiResponse({ description: 'Payment retreived successfully', type: PaymentApiResponseDto })
    @ApiNotFoundResponse({ description: 'Payment not found' })
    async findOne(@Param('id') id: string, @GetUser('id') userId: string) {
        return await this.paymentsService.findOne(id, userId);
    }

    // Find payment by order ID
    @Get('order/:orderId')
    @ApiParam({ name:'orderId', description:'Order ID', example:'88783-2253-32432342' })
    @ApiOperation({ summary: 'Get payment by order ID', description: 'Get a specific payment by order ID'})
    @ApiOkResponse({ description: 'Payment retreived successfully', type: PaymentApiResponseDto })
    @ApiNotFoundResponse({ description: 'Payment not found' })
    async findByOrderId(@Param('orderId') orderId: string, @GetUser('id') userId: string) {
        return await this.paymentsService.findByOrder(orderId, userId);
    }


}
