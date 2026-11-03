import { Field, InputType } from "@nestjs/graphql";
import { IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

@InputType()
export class CreateOrderInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  title!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
