import { Args, Context, Int, Mutation, Query, Resolver } from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";
import { GqlJwtAuthGuard } from "auth/gql-jwt-auth.guard";
import { InventoryApiService } from "inventory/inventory-api.service";
import { CreateOrderInput } from "inventory/graphql/inputs/create-order.input";
import { CreateProductInput } from "inventory/graphql/inputs/create-product.input";
import { UpdateCurrentUserInput } from "inventory/graphql/inputs/update-current-user.input";
import {
  OrderModel,
  OrderTotalModel,
  PriceModel,
  ProductCondition,
  ProductModel,
  ProductStatus,
  UserModel,
  UsersPageModel,
} from "inventory/graphql/models/inventory.model";
import { MediaStorageService } from "inventory/media-storage.service";
import { CacheService } from "inventory/cache.service";
import type {
  InventoryOrder,
  InventoryPrice,
  InventoryProduct,
  InventoryUser,
} from "inventory/types/inventory.types";

@Resolver()
@UseGuards(GqlJwtAuthGuard)
export class InventoryResolver {
  constructor(
    private readonly inventory: InventoryApiService,
    private readonly media?: MediaStorageService,
    private readonly cache?: CacheService,
  ) {}

  @Query(() => [OrderModel])
  async orders(): Promise<OrderModel[]> {
    return this.cacheValue("inventory:orders", () =>
      this.inventory.findOrders(),
    ).then((items) => items.map(toOrderModel));
  }

  @Query(() => OrderModel, { nullable: true })
  async order(@Args("id", { type: () => Int }) id: number) {
    const order = await this.cacheValue(`inventory:order:${String(id)}`, () =>
      this.inventory.findOrder(id),
    );
    return order ? toOrderModel(order) : null;
  }

  @Query(() => [ProductModel])
  async products(
    @Args("type", { type: () => String, nullable: true }) type?: string,
  ): Promise<ProductModel[]> {
    return this.cacheValue(`inventory:products:${type ?? "all"}`, () =>
      this.inventory.findProducts(type),
    ).then((items) => items.map(toProductModel));
  }

  @Query(() => [String])
  productTypes(): Promise<string[]> {
    return this.cacheValue("inventory:product-types", () =>
      this.inventory.findProductTypes(),
    );
  }

  @Query(() => UsersPageModel)
  async users(
    @Args("page", { type: () => Int, defaultValue: 1 }) page: number,
    @Args("pageSize", { type: () => Int, defaultValue: 10 }) pageSize: number,
  ): Promise<UsersPageModel> {
    const result = await this.cacheValue(
      `inventory:users:${String(page)}:${String(pageSize)}`,
      () => this.inventory.findUsers(page, pageSize),
    );
    return { ...result, items: result.items.map(toUserModel) };
  }

  @Query(() => UserModel, { nullable: true })
  async currentUser(
    @Context() context: { req: { user: InventoryUser } },
  ): Promise<UserModel | null> {
    const user = await this.cacheValue(`inventory:current-user:${String(context.req.user.id)}`, () =>
      this.inventory.findUserById(context.req.user.id),
    );
    return user ? toUserModel(user) : null;
  }

  @Mutation(() => OrderModel)
  async createOrder(
    @Args("input") input: CreateOrderInput,
  ): Promise<OrderModel> {
    const result = await this.inventory.createOrder(input);
    await this.invalidate("inventory:orders", "inventory:order:");
    return toOrderModel(result);
  }

  @Mutation(() => ProductModel)
  async createProduct(
    @Args("input") input: CreateProductInput,
  ): Promise<ProductModel> {
    const photoUrl = input.photo
      ? await this.requireMedia().save(input.photo, "product")
      : undefined;
    const product = await this.inventory.createProduct({
      orderId: input.orderId,
      title: input.title,
      serialNumber: input.serialNumber,
      type: input.type,
      photoUrl,
    });
    await this.invalidate(
      "inventory:orders",
      "inventory:order:",
      "inventory:products:",
      "inventory:product-types",
    );
    return toProductModel(product);
  }

  @Mutation(() => UserModel)
  async updateCurrentUser(
    @Args("input") input: UpdateCurrentUserInput,
    @Context() context: { req: { user: InventoryUser } },
  ): Promise<UserModel> {
    const current = input.avatar ? await this.inventory.findUserById(context.req.user.id) : null;
    const avatarUrl = input.avatar
      ? await this.requireMedia().save(input.avatar, "avatar")
      : undefined;
    const user = await this.inventory.updateCurrentUser(context.req.user.id, {
      name: input.name,
      avatarUrl,
    });
    if (avatarUrl && this.media) await this.media.remove(current?.avatarUrl);
    await this.invalidate("inventory:current-user:", "inventory:users:");
    return toUserModel(user);
  }

  @Mutation(() => Boolean)
  async deleteOrder(
    @Args("id", { type: () => Int }) id: number,
  ): Promise<boolean> {
    const result = await this.inventory.deleteOrder(id);
    await this.invalidate(
      "inventory:orders",
      "inventory:order:",
      "inventory:products:",
    );
    return result;
  }

  @Mutation(() => Boolean)
  async deleteProduct(
    @Args("id", { type: () => Int }) id: number,
  ): Promise<boolean> {
    const product = await this.inventory.deleteProduct(id);
    if (this.media) await this.media.remove(product?.photoUrl);
    await this.invalidate(
      "inventory:orders",
      "inventory:order:",
      "inventory:products:",
    );
    return product !== null;
  }

  private requireMedia(): MediaStorageService {
    if (!this.media) throw new Error("Media storage is unavailable");
    return this.media;
  }

  private cacheValue<T>(key: string, load: () => Promise<T>): Promise<T> {
    return this.cache ? this.cache.getOrSet(key, 60, load) : load();
  }

  private async invalidate(...prefixes: string[]): Promise<void> {
    const cache = this.cache;
    if (cache)
      await Promise.all(
        prefixes.map((prefix) => cache.invalidatePrefix(prefix)),
      );
  }
}

function toOrderModel(order: InventoryOrder): OrderModel {
  return {
    id: order.id,
    title: order.title,
    description: order.description,
    createdAt: order.createdAt,
    productCount: order.productCount,
    totals: Object.entries(order.totals).map(
      ([currency, value]): OrderTotalModel => ({ currency, value }),
    ),
    products: order.products.map(toProductModel),
  };
}

function toProductModel(product: InventoryProduct): ProductModel {
  return {
    id: product.id,
    serialNumber: product.serialNumber,
    title: product.title,
    type: product.type,
    specification: product.specification,
    photoUrl: product.photoUrl,
    condition: toProductCondition(product.condition),
    status: toProductStatus(product.status),
    guaranteeStart: product.guaranteeStart,
    guaranteeEnd: product.guaranteeEnd,
    receivedAt: product.receivedAt,
    orderId: product.orderId,
    order: product.order,
    prices: product.prices.map(toPriceModel),
  };
}

function toUserModel(user: InventoryUser): UserModel {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt,
  };
}

function toPriceModel(price: InventoryPrice): PriceModel {
  return {
    value: Number(price.value),
    currency: price.currency,
    isDefault: price.isDefault,
  };
}

function toProductCondition(
  condition: InventoryProduct["condition"],
): ProductCondition {
  return condition === "NEW" ? ProductCondition.NEW : ProductCondition.USED;
}

function toProductStatus(status: InventoryProduct["status"]): ProductStatus {
  switch (status) {
    case "AVAILABLE":
      return ProductStatus.AVAILABLE;
    case "IN_REPAIR":
      return ProductStatus.IN_REPAIR;
    case "ASSIGNED":
      return ProductStatus.ASSIGNED;
  }
}
