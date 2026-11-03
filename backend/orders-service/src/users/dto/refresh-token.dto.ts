import { IsOptional, IsString, Length } from "class-validator";

export class RefreshTokenDto {
  @IsOptional()
  @IsString()
  @Length(64, 64)
  tokenHash?: string;
}
