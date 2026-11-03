import { Field, ObjectType } from "@nestjs/graphql";
import { UserModel } from "inventory/graphql/models/inventory.model";

@ObjectType()
export class AuthSessionModel {
  @Field()
  accessToken!: string;

  @Field()
  refreshToken!: string;

  @Field(() => UserModel)
  user!: UserModel;
}
