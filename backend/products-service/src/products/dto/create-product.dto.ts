import {
  IsInt,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";
import {
  ProductCondition,
  ProductStatus,
} from "generated/prisma/client";

export class CreateProductDto {
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
