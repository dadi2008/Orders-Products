import { Field, InputType } from "@nestjs/graphql";
import { IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";
import { Type } from "class-transformer";
import { MediaUploadInput } from "inventory/graphql/inputs/media-upload.input";

@InputType()
export class UpdateCurrentUserInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  name!: string;

  @Field(() => MediaUploadInput, { nullable: true })
  @IsOptional()
  @Type(() => MediaUploadInput)
  avatar?: MediaUploadInput;
}
