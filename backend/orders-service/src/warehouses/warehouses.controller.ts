import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
} from "@nestjs/common";
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from "class-validator";
import { OrdersPrismaService } from "database/prisma.service";

class CreateWarehouseDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name!: string;
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  address!: string;
  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number;
  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: number;
}

@Controller("warehouses")
export class WarehousesController {
  constructor(private readonly prisma: OrdersPrismaService) {}

  @Get()
  findAll() {
    return this.prisma.warehouse.findMany({ orderBy: { id: "asc" } });
  }

  @Post()
  async create(@Body() input: CreateWarehouseDto) {
    let { latitude, longitude } = input;
    if (latitude === undefined || longitude === undefined) {
      try {
        const url = new URL("https://nominatim.openstreetmap.org/search");
        url.search = new URLSearchParams({
          q: input.address,
          format: "json",
          limit: "1",
        }).toString();
        const response = await fetch(url, {
          headers: { "User-Agent": "OrdersProductsInventory/1.0" },
          signal: AbortSignal.timeout(8000),
        });
        if (!response.ok) throw new Error("Geocoding unavailable");
        const results = (await response.json()) as {
          lat: string;
          lon: string;
        }[];
        latitude = Number(results[0]?.lat);
        longitude = Number(results[0]?.lon);
        if (!Number.isFinite(latitude) || !Number.isFinite(longitude))
          throw new Error("Address not found");
      } catch {
        throw new BadRequestException(
          "Unable to locate address. Enter coordinates manually.",
        );
      }
    }
    return this.prisma.warehouse.create({
      data: {
        name: input.name.trim(),
        address: input.address.trim(),
        latitude,
        longitude,
      },
    });
  }
}
