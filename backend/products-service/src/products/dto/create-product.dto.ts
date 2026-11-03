import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";

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

  @IsOptional()
  @IsString()
  @MaxLength(240)
  photoUrl?: string;
}
