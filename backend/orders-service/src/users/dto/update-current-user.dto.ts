import { IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

export class UpdateCurrentUserDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(240)
  avatarUrl?: string;
}
