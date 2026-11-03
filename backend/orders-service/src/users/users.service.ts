import { ConflictException, Injectable } from "@nestjs/common";
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { OrdersPrismaService } from "database/prisma.service";
import { UpdateCurrentUserDto } from "users/dto/update-current-user.dto";
import { RegisterUserDto } from "users/dto/register-user.dto";

const scrypt = promisify(scryptCallback);

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

  current(id = 1) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  updateCurrent(id: number, dto: UpdateCurrentUserDto) {
    return this.prisma.user.update({
      where: { id },
      data: { name: dto.name, avatarUrl: dto.avatarUrl },
    });
  }

  async register(dto: RegisterUserDto) {
    const email = dto.email.trim().toLowerCase();
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) throw new ConflictException("Email is already registered");
    return this.prisma.user.create({
      data: {
        name: dto.name.trim(),
        email,
        passwordHash: await hashSecret(dto.password),
      },
    });
  }

  async validate(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });
    if (!user || !(await matchesSecret(password, user.passwordHash))) return null;
    return user;
  }

  async setRefreshTokenHash(id: number, tokenHash: string | null) {
    return this.prisma.user.update({
      where: { id },
      data: { refreshTokenHash: tokenHash },
    });
  }

  async hasRefreshTokenHash(id: number, tokenHash: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return Boolean(user?.refreshTokenHash && safeEqual(user.refreshTokenHash, tokenHash));
  }
}

export async function hashSecret(value: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scrypt(value, salt, 64)) as Buffer;
  return `${salt}:${Buffer.from(derived).toString("hex")}`;
}

async function matchesSecret(value: string, stored: string): Promise<boolean> {
  const [salt, expected] = stored.split(":");
  if (!salt || !expected) return false;
  const derived = (await scrypt(value, salt, 64)) as Buffer;
  return safeEqual(Buffer.from(derived).toString("hex"), expected);
}

function safeEqual(left: string, right: string): boolean {
  const leftValue = Buffer.from(left);
  const rightValue = Buffer.from(right);
  return leftValue.length === rightValue.length && timingSafeEqual(leftValue, rightValue);
}
