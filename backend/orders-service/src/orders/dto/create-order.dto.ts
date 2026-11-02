import { IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
