import { Injectable } from "@nestjs/common";
import { OrdersPrismaService } from "database/prisma.service";
import { UpdateCurrentUserDto } from "users/dto/update-current-user.dto";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: OrdersPrismaService) {}

  async findPage(page: number, pageSize: number) {
    const skip = (page - 1) * pageSize;
    const [items, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        skip,
        take: pageSize,
        orderBy: { id: "asc" },
      }),
      this.prisma.user.count(),
    ]);
    return { items, total, page, pageSize };
  }

  current() {
    return this.prisma.user.findUnique({ where: { id: 1 } });
  }

  updateCurrent(dto: UpdateCurrentUserDto) {
    return this.prisma.user.update({
      where: { id: 1 },
      data: { name: dto.name, avatarUrl: dto.avatarUrl },
    });
  }
}
