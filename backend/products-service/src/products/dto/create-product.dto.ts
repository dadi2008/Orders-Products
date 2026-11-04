import {
  IsInt,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  IsNumber,
  Min,
  Max,
} from "class-validator";
import {
  ProductCondition,
  ProductStatus,
} from "generated/prisma/client";

export class CreateProductDto {
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(9999999999.99)
  price: number = 0;

  @IsInt()
  orderId!: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  orderTitle!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  serialNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  type?: string;

  @IsEnum(ProductCondition)
  condition!: ProductCondition;

  @IsEnum(ProductStatus)
  status!: ProductStatus;

  @IsOptional()
  @IsString()
  @MaxLength(240)
  photoUrl?: string;
}
