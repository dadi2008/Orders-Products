import { Body, Controller, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { LoginUserDto } from "users/dto/login-user.dto";
import { RefreshTokenDto } from "users/dto/refresh-token.dto";
import { RegisterUserDto } from "users/dto/register-user.dto";
import { UpdateCurrentUserDto } from "users/dto/update-current-user.dto";
import { UsersService } from "users/users.service";

@Controller("users")
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  findPage(
    @Query("page") page = "1",
    @Query("pageSize") pageSize = "10",
    @Query("search") search?: string,
  ) {
    return this.users.findPage(
      Math.max(1, Number(page)),
      Math.min(50, Math.max(1, Number(pageSize))),
      search,
    );
  }

  @Get("current")
  current() {
    return this.users.current();
  }

  @Patch("current")
  updateCurrent(@Body() dto: UpdateCurrentUserDto) {
    return this.users.updateCurrent(1, dto);
  }

  @Get(":id")
  currentById(@Param("id") id: string) {
    return this.users.current(Number(id));
  }

  @Patch(":id")
  updateCurrentById(@Param("id") id: string, @Body() dto: UpdateCurrentUserDto) {
    return this.users.updateCurrent(Number(id), dto);
  }

  @Post("auth/register")
  register(@Body() dto: RegisterUserDto) {
    return this.users.register(dto);
  }

  @Post("auth/validate")
  validate(@Body() dto: LoginUserDto) {
    return this.users.validate(dto.email, dto.password);
  }

  @Patch("auth/:id/refresh-token")
  setRefreshToken(@Param("id") id: string, @Body() dto: RefreshTokenDto) {
    return this.users.setRefreshTokenHash(Number(id), dto.tokenHash ?? null);
  }

  @Post("auth/:id/refresh-token/validate")
  hasRefreshToken(@Param("id") id: string, @Body() dto: RefreshTokenDto) {
    return this.users.hasRefreshTokenHash(Number(id), dto.tokenHash ?? "");
  }
}
