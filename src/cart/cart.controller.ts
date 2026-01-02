import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddItemDto } from './dto/add-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

/**
 * Controller for managing the user's shopping cart.
 * All endpoints require authentication.
 */
@ApiTags('Cart')
@ApiBearerAuth('JWT-auth')
@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) { }

  /**
   * Retrieves the current user's cart and its items.
   * @param user The current authenticated user.
   * @returns The user's cart.
   */
  @Get()
  @ApiOperation({ summary: 'Get current user cart' })
  @ApiResponse({ status: 200, description: 'Return cart.' })
  getCart(@CurrentUser() user: { userId: string }) {
    return this.cartService.getCart(user.userId);
  }

  /**
   * Adds a product to the user's cart.
   * @param user The current authenticated user.
   * @param dto The item data (productId, quantity).
   * @returns The added cart item.
   */
  @Post('items')
  @ApiOperation({ summary: 'Add item to cart' })
  @ApiResponse({ status: 201, description: 'Item added.' })
  addItem(@CurrentUser() user: { userId: string }, @Body() dto: AddItemDto) {
    return this.cartService.addItem(user.userId, dto);
  }

  /**
   * Updates the quantity of an item in the user's cart.
   * @param user The current authenticated user.
   * @param itemId The ID of the cart item to update.
   * @param dto The new quantity.
   * @returns The updated cart item.
   */
  @Patch('items/:itemId')
  @ApiOperation({ summary: 'Update cart item quantity' })
  @ApiResponse({ status: 200, description: 'Item updated.' })
  updateItem(
    @CurrentUser() user: { userId: string },
    @Param('itemId') itemId: string,
    @Body() dto: UpdateItemDto,
  ) {
    return this.cartService.updateItem(user.userId, itemId, dto);
  }

  /**
   * Removes an item from the user's cart.
   * @param user The current authenticated user.
   * @param itemId The ID of the cart item to remove.
   * @returns A success message.
   */
  @Delete('items/:itemId')
  @ApiOperation({ summary: 'Remove item from cart' })
  @ApiResponse({ status: 200, description: 'Item removed.' })
  removeItem(@CurrentUser() user: { userId: string }, @Param('itemId') itemId: string) {
    return this.cartService.removeItem(user.userId, itemId);
  }
}