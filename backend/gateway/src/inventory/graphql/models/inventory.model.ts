import {
  Field,
  Float,
  Int,
  ObjectType,
  registerEnumType,
} from "@nestjs/graphql";

export enum ProductCondition {
  NEW = "NEW",
  USED = "USED",
}

export enum ProductStatus {
  AVAILABLE = "AVAILABLE",
  IN_REPAIR = "IN_REPAIR",
  ASSIGNED = "ASSIGNED",
}

registerEnumType(ProductCondition, { name: "ProductCondition" });
registerEnumType(ProductStatus, { name: "ProductStatus" });

@ObjectType()
export class PriceModel {
  @Field(() => Float)
  value!: number;

  @Field()
  currency!: string;

  @Field()
  isDefault!: boolean;
}

@ObjectType()
export class OrderReferenceModel {
  @Field(() => Int)
  id!: number;

  @Field()
  title!: string;
}

@ObjectType()
export class ProductModel {
  @Field(() => Int)
  id!: number;

  @Field()
  serialNumber!: string;

  @Field()
  title!: string;

  @Field()
  type!: string;

  @Field(() => String, { nullable: true })
  specification?: string | null;

  @Field(() => String, { nullable: true })
  photoUrl?: string | null;

  @Field(() => ProductCondition)
  condition!: ProductCondition;

  @Field(() => ProductStatus)
  status!: ProductStatus;

  @Field()
  guaranteeStart!: string;

  @Field()
  guaranteeEnd!: string;

  @Field()
  receivedAt!: string;

  @Field(() => Int)
  orderId!: number;

  @Field(() => OrderReferenceModel)
  order!: OrderReferenceModel;

  @Field(() => [PriceModel])
  prices!: PriceModel[];
}

@ObjectType()
export class OrderTotalModel {
  @Field()
  currency!: string;

  @Field(() => Float)
  value!: number;
}

@ObjectType()
export class OrderModel {
  @Field(() => Int)
  id!: number;

  @Field()
  title!: string;

  @Field(() => String, { nullable: true })
  description?: string | null;

  @Field()
  createdAt!: string;

  @Field(() => Int)
  productCount!: number;

  @Field(() => [OrderTotalModel])
  totals!: OrderTotalModel[];

  @Field(() => [ProductModel])
  products!: ProductModel[];
}

@ObjectType()
export class UserModel {
  @Field(() => Int)
  id!: number;

  @Field()
  name!: string;

  @Field()
  email!: string;

  @Field(() => String, { nullable: true })
  avatarUrl?: string | null;

  @Field()
  createdAt!: string;
}

@ObjectType()
export class UsersPageModel {
  @Field(() => [UserModel])
  items!: UserModel[];

  @Field(() => Int)
  total!: number;

  @Field(() => Int)
  page!: number;

  @Field(() => Int)
  pageSize!: number;
}
