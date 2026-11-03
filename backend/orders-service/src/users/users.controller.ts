import { Controller, Get, Patch, Body, Query } from "@nestjs/common";
import { UpdateCurrentUserDto } from "users/dto/update-current-user.dto";
import { UsersService } from "users/users.service";

@Controller("users")
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  findPage(@Query("page") page = "1", @Query("pageSize") pageSize = "10") {
    return this.users.findPage(
      Math.max(1, Number(page)),
      Math.min(50, Math.max(1, Number(pageSize))),
    );
  }

  @Get("current")
  current() {
    return this.users.current();
  }

  @Patch("current")
  updateCurrent(@Body() dto: UpdateCurrentUserDto) {
    return this.users.updateCurrent(dto);
  }
}
