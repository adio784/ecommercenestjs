import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { Stripe } from 'stripe';
import { CreatePaymentIntendResponseDto, PaymentApiResponseDto, PaymentResponseDto } from './dto/payment-response.dto.js';
import { CreatePaymentIntentDto } from './dto/create-payment-intend.dto.js';
import { PaymentStatus } from '../../generated/prisma/enums.js';
import { createPaymentDto } from './dto/create-payment.dto.js';
import { Prisma } from '../../generated/prisma/client.js';

@Injectable()
export class PaymentsService {

    private stripe: Stripe;
    constructor(private prisma : PrismaService) {
        this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
            apiVersion: '2026-08-26.dahlia',
        });
    }

    async createPaymentIntent(userId: string, createPaymentIntentDto: CreatePaymentIntentDto): Promise<{
        success: boolean;
        data: {clientSecrete: string, paymentId: string};
        message?: string
    }> {
        const { orderId, amount, currency = 'usd' } = createPaymentIntentDto;  
        const order = await this.prisma.order.findFirst({
            where : { id: orderId, userId }
        });

        if (!order) {
            throw new NotFoundException(`Order with ID ${orderId} not found`);
        }

        const existingPayment = await this.prisma.payment.findFirst({
            where: { orderId }
        });

        if (existingPayment && existingPayment.status !== PaymentStatus.COMPLETED) {
            throw new BadRequestException('Payment already completed for this order');
        }

        const paymentIntent = await this.stripe.paymentIntents.create({
            amount: Math.round(amount * 100),
            currency,
            metadata: {  orderId, userId },
            automatic_payment_methods: {
                enabled: true,
            },
        });

        const payment = await this.prisma.payment.create({
            data: {
                orderId,
                userId,
                amount,
                currency,
                status: PaymentStatus.PENDING,
                paymentMethod: 'STRIPE',
                transactionId: paymentIntent.id,
            }
        });

        return {
            success: true,
            data: {
                clientSecrete: paymentIntent.client_secret!,
                paymentId: payment.id
            },
            message: 'Payment intent created successfully'
        }

    }
       

    // Confirm payment intent
    async confirmPayment( userId: string, createPaymentDto: createPaymentDto ): Promise<{success: boolean, data: PaymentResponseDto; message?: string}> {
        const { paymentIntentId, orderId } = createPaymentDto;

        const payment = await this.prisma.payment.findFirst({
            where: { orderId, userId, transactionId: paymentIntentId }
        });

        if (!payment) {
            throw new NotFoundException('Payment not found');
        }

        if (payment.status === PaymentStatus.COMPLETED) {
            throw new BadRequestException('Payment already completed');
        }

        const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
        if (paymentIntent.status !== 'succeeded') {
            throw new BadRequestException('Payment failed');
        }

        const [updatedPayment] = await this.prisma.payment.$transaction([
            this.prisma.payment.update({
                where: { id: payment.id },
                data: { status: PaymentStatus.COMPLETED }
            }),

            this.prisma.order.update({
                where: { id: orderId },
                data: { status: 'PROCESSING' }
            })
        ]);

        const order = await this.prisma.order.findFirst({
            where: { id: orderId }
        });

        if (order?.cartId) {
            await this.prisma.cart.update({
                where: { id: order.cartId },
                data: { checkout: true }
            })
        }

        return {
            success: true,
            data: await this.mapToPaymentResponse(updatedPayment),
            message: 'Payment confirmed successfully'
        }
    }

    // Get all payment for current user
    async findAll(userId: string): Promise<{
        success: boolean;
        data: PaymentResponseDto[];
        message: string;
    }> {
        const payments = await this.prisma.payment.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc'}
        });

        return {
            success: true,
            data: await Promise.all(payments.map((payment) => this.mapToPaymentResponse(payment))),
            message: "Payment Retrieved"
        }
    }

    // Get a single payment
    async findOne(id: string, userId: string): Promise<{
        success: boolean,
        data: PaymentResponseDto,
        message: string
    }> {
        
        const payment = await this.prisma.payment.findFirst({
            where: { id, userId }
        });

        if (!payment) {
            throw new NotFoundException(`Payment with ID ${id} not found`);
        }

        return {
            success: true,
            data: await this.mapToPaymentResponse(payment),
            message: 'Payment retrieved successfully'
        }
    }

    // Get a payment by order
    async findByOrder(orderId: string, userId: string): Promise<{success: boolean, data: PaymentResponseDto | null, message: string}> {
        const payment = await this.prisma.payment.findFirst({
            where: { orderId, userId }
        });

        return {
            success: true,
            data: payment ? await this.mapToPaymentResponse(payment) : null,
            message: 'Payment retrieved successfully'
        }
    }



    // Private map payment response 
    async mapToPaymentResponse(payment: {
        id: string;
        orderId: string;
        userId: string;
        amount: Prisma.Decimal;
        currency: string;
        status: PaymentStatus;
        paymentMethod: string | null;
        transactionId: string | null;
        createdAt: Date;    
        updatedAt: Date;
    }): Promise<PaymentResponseDto> {
        
        return {
            id: payment.id,
            orderId: payment.orderId,
            userId: payment.userId,
            currency: payment.currency,
            amount: payment.amount.toString(),
            status: payment.status,
            paymentMethod: payment.paymentMethod,
            transactionId: payment.transactionId ?? '',
            createdAt: payment.createdAt,
            updatedAt: payment.updatedAt
        }
    }
    
}


