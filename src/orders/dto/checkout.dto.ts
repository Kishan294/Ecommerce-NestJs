import { IsObject, IsString, IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

// Simple validation for address structure
export class AddressDto {
  @IsString()
  @IsNotEmpty()
  line1!: string;

  @IsString()
  line2?: string;

  @IsString()
  @IsNotEmpty()
  city!: string;

  @IsString()
  @IsNotEmpty()
  postalCode!: string;

  @IsString()
  @IsNotEmpty()
  country!: string;
}

export class CheckoutDto {
  @IsObject()
  @ValidateNested()
  @Type(() => AddressDto)
  shippingAddress!: AddressDto;

  @IsString()
  paymentMethod!: string; // e.g. 'stripe', 'paypal', 'cod'
}