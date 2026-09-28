import { Module } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './modules/users/users.module.js';
import { CategoryModule } from './modules/category/category.module.js';
import { ProductModule } from './modules/product/product.module.js';
import { OrdersModule } from './modules/orders/orders.module.js';
import { ThrottlerModule } from '@nestjs/throttler';
import { PaymentsModule } from './modules/payments/payments.module.js';
import { CartsModule } from './modules/carts/carts.module.js';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot([
     { 
        ttl: 60,
        limit: 10,
     }
    ]),
    PrismaModule, 
    AuthModule, UsersModule, CategoryModule, ProductModule, OrdersModule, PaymentsModule, CartsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
