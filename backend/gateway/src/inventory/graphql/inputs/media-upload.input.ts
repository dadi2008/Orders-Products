import { Field, InputType } from "@nestjs/graphql";
import { IsNotEmpty, IsString, MaxLength } from "class-validator";

@InputType()
export class MediaUploadInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  filename!: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(7_000_000)
  dataUrl!: string;
}
