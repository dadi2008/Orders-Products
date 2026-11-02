import { ConfigService } from "@nestjs/config";

export function getKafkaBrokers(config: ConfigService): string[] {
  const value = config.get<string>("KAFKA_BROKERS");
  const brokers =
    value
      ?.split(",")
      .map((broker) => broker.trim())
      .filter(Boolean) ?? [];

  if (!brokers.length) throw new Error("KAFKA_BROKERS is required");

  return brokers;
}
