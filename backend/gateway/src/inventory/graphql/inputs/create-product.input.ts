import { Field, Float, InputType, Int } from "@nestjs/graphql";
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
import { Type } from "class-transformer";
import { MediaUploadInput } from "inventory/graphql/inputs/media-upload.input";
import {
  ProductCondition,
  ProductStatus,
} from "inventory/graphql/models/inventory.model";

@InputType()
export class CreateProductInput {
  @Field(() => Float, { defaultValue: 0 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(9999999999.99)
  price: number = 0;

  @Field(() => Int)
  @IsInt()
  orderId!: number;

  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  title!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  serialNumber?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  type?: string;

  @Field(() => ProductCondition)
  @IsEnum(ProductCondition)
  condition!: ProductCondition;

  @Field(() => ProductStatus)
  @IsEnum(ProductStatus)
  status!: ProductStatus;

  @Field(() => MediaUploadInput, { nullable: true })
  @IsOptional()
  @Type(() => MediaUploadInput)
  photo?: MediaUploadInput;
}
