import { IsObject, IsString, IsNotEmpty } from 'class-validator';

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
  shippingAddress!: AddressDto;

  @IsString()
  paymentMethod!: string; // e.g. 'stripe', 'paypal', 'cod'
}