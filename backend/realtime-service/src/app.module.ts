import { Module } from "@nestjs/common";
import { PresenceModule } from "./presence/presence.module";

@Module({ imports: [PresenceModule] })
export class AppModule {}
