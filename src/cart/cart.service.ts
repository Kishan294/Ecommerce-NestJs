import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddItemDto } from './dto/add-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) { }

  // Helper to get or create a cart for a user
  private async getOrCreateCart(userId: string) {
    let cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true } } },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId },
        include: { items: { include: { product: true } } },
      });
    }
    return cart;
  }

  async getCart(userId: string) {
    return this.getOrCreateCart(userId);
  }

  async addItem(userId: string, dto: AddItemDto) {
    // 1. Check product exists and has stock
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Note: In a real high-concurrency system, you might want to lock the row here
    // or handle optimistic locking. For now, we check current stock.
    if (product.stock < dto.quantity) {
      throw new BadRequestException('Insufficient stock');
    }

    // 2. Get or Create Cart
    const cart = await this.getOrCreateCart(userId);

    // 3. Upsert CartItem (add if not exists, update quantity if exists)
    const cartItem = await this.prisma.cartItem.upsert({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId: dto.productId,
        },
      },
      update: {
        quantity: { increment: dto.quantity },
      },
      create: {
        cartId: cart.id,
        productId: dto.productId,
        quantity: dto.quantity,
      },
      include: { product: true },
    });

    // 4. Re-check stock after update (in case cart quantity + new quantity exceeds stock)
    if (cartItem.quantity > product.stock) {
      // Rollback: Reduce quantity back to max allowed
      await this.prisma.cartItem.update({
        where: { id: cartItem.id },
        data: { quantity: product.stock },
      });
      throw new BadRequestException(
        `Cannot add more than available stock. Max available: ${product.stock}`,
      );
    }

    return cartItem;
  }

  async updateItem(userId: string, itemId: string, dto: UpdateItemDto) {
    // 1. Verify item belongs to user's cart
    const cartItem = await this.prisma.cartItem.findFirst({
      where: { id: itemId, cart: { userId } },
      include: { product: true },
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    if (dto.quantity > cartItem.product.stock) {
      throw new BadRequestException('Insufficient stock');
    }

    return this.prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity: dto.quantity },
      include: { product: true },
    });
  }

  async removeItem(userId: string, itemId: string) {
    // Verify ownership
    const cartItem = await this.prisma.cartItem.findFirst({
      where: { id: itemId, cart: { userId } },
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    await this.prisma.cartItem.delete({ where: { id: itemId } });
    return { message: 'Item removed' };
  }

  async clearCart(userId: string) {
    const cart = await this.prisma.cart.findUnique({ where: { userId } });
    if (cart) {
      await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    }
  }
}