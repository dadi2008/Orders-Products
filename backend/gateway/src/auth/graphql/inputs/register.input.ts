import { Field, InputType } from "@nestjs/graphql";
import { IsEmail, IsString, MaxLength, MinLength } from "class-validator";

@InputType()
export class RegisterInput {
  @Field()
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  name!: string;

  @Field()
  @IsEmail()
  @MaxLength(255)
  email!: string;

  @Field()
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;
}
