import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CheckoutDto } from './dto/checkout.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

/**
 * Controller for managing customer orders.
 * Handles the checkout process, order history, and administrative status updates.
 */
@ApiTags('Orders')
@ApiBearerAuth('JWT-auth')
@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) { }

  /**
   * Processes the checkout for the current user's cart.
   * Creates an order and clears the cart.
   * @param user The current authenticated user.
   * @param dto Checkout details (shipping, payment method).
   * @returns The created order details.
   */
  @Post('checkout')
  @ApiOperation({ summary: 'Checkout current cart' })
  @ApiResponse({ status: 201, description: 'Order created.' })
  checkout(@CurrentUser() user: { userId: string }, @Body() dto: CheckoutDto) {
    return this.ordersService.checkout(user.userId, dto);
  }

  /**
   * Retrieves the order history for the current user.
   * @param user The current authenticated user.
   * @returns A list of the user's orders.
   */
  @Get()
  @ApiOperation({ summary: 'Get order history' })
  @ApiResponse({ status: 200, description: 'Return order list.' })
  getHistory(@CurrentUser() user: { userId: string }) {
    return this.ordersService.findAll(user.userId);
  }

  /**
   * Retrieves the details of a specific order.
   * Customers can only see their own orders; Admins can see any order.
   * @param user The current authenticated user.
   * @param id The ID of the order.
   * @returns The order details.
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get order details' })
  @ApiResponse({ status: 200, description: 'Return order.' })
  @ApiResponse({ status: 404, description: 'Order not found.' })
  findOne(
    @CurrentUser() user: { userId: string; role: string },
    @Param('id') id: string,
  ) {
    const isAdmin = user.role === 'ADMIN';
    return this.ordersService.findOne(id, user.userId, isAdmin);
  }

  /**
   * Updates the status of an existing order. (Admin only)
   * @param id The ID of the order to update.
   * @param dto The new status.
   * @returns The updated order.
   */
  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Update order status (Admin only)' })
  @ApiResponse({ status: 200, description: 'Status updated.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(id, dto.status);
  }
}