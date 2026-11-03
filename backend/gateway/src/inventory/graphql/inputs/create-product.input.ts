import { Field, InputType, Int } from "@nestjs/graphql";
import {
  IsInt,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";
import { Type } from "class-transformer";
import { MediaUploadInput } from "inventory/graphql/inputs/media-upload.input";
import {
  ProductCondition,
  ProductStatus,
} from "inventory/graphql/models/inventory.model";

@InputType()
export class CreateProductInput {
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
