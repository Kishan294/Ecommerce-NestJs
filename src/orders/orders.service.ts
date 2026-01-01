import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CartService } from '../cart/cart.service';
import { CheckoutDto } from './dto/checkout.dto';
import { Decimal } from '@prisma/client/runtime/client';
import { OrderStatus } from 'src/generated/prisma/enums';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cartService: CartService,
  ) { }

  async checkout(userId: string, dto: CheckoutDto) {
    // 1. Get the user's cart
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true } } },
    });

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    // 2. Calculate Total
    let total = new Decimal(0);
    for (const item of cart.items) {
      total = total.add(item.product.price.mul(item.quantity));
    }

    // 3. Perform Transaction
    // We use $transaction to ensure all DB operations succeed or none do.
    const order = await this.prisma.$transaction(async (tx) => {
      // A. Validate Stock again (inside transaction)
      for (const item of cart.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          select: { stock: true },
        });

        if (!product || product.stock < item.quantity) {
          // Throw error to rollback transaction
          throw new BadRequestException(
            `Insufficient stock for product: ${item.product.title}`,
          );
        }
      }

      // B. Create Order
      const newOrder = await tx.order.create({
        data: {
          userId,
          total,
          status: OrderStatus.PENDING,
          shippingAddress: dto.shippingAddress as any, // stored as Json
          paymentMethod: dto.paymentMethod,
          paymentStatus: 'PENDING', // would update after real payment callback
        },
      });

      // C. Create Order Items & Decrement Stock
      for (const item of cart.items) {
        await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.product.price,
          },
        });

        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { decrement: item.quantity },
          },
        });
      }

      // D. Clear Cart
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      return newOrder;
    });

    return order;
  }

  async findAll(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(orderId: string, userId: string, isAdmin = false) {
    const where: any = { id: orderId };
    if (!isAdmin) {
      where.userId = userId;
    }

    const order = await this.prisma.order.findFirst({
      where,
      include: { items: { include: { product: true } } },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async updateStatus(orderId: string, status: OrderStatus) {
    return this.prisma.order.update({
      where: { id: orderId },
      data: { status },
    });
  }
}