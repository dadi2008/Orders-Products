import { Field, Float, InputType, Int, ObjectType } from "@nestjs/graphql";
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from "class-validator";

@ObjectType()
export class WarehouseModel {
  @Field(() => Int)
  id!: number;
  @Field()
  name!: string;
  @Field()
  address!: string;
  @Field(() => Float)
  latitude!: number;
  @Field(() => Float)
  longitude!: number;
}

@InputType()
export class CreateWarehouseInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name!: string;
  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  address!: string;
  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number;
  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: number;
}
