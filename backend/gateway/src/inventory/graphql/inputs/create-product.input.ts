import { Field, InputType, Int } from "@nestjs/graphql";
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";
import { Type } from "class-transformer";
import { MediaUploadInput } from "inventory/graphql/inputs/media-upload.input";

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

  @Field(() => MediaUploadInput, { nullable: true })
  @IsOptional()
  @Type(() => MediaUploadInput)
  photo?: MediaUploadInput;
}
