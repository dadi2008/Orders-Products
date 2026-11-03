import { BadRequestException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { randomUUID } from "node:crypto";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";
import type { MediaUploadInput } from "inventory/graphql/inputs/media-upload.input";

const mimeExtensions: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

@Injectable()
export class MediaStorageService {
  private readonly directory: string;

  constructor(config: ConfigService) {
    this.directory = config.get("MEDIA_DIR") ?? join(process.cwd(), "media");
  }

  async save(upload: MediaUploadInput, prefix: string): Promise<string> {
    const match = /^data:([^;]+);base64,([a-zA-Z0-9+/=]+)$/.exec(
      upload.dataUrl,
    );
    if (!match) throw new BadRequestException("Invalid image data");
    const extension = mimeExtensions[match[1]];
    if (!extension) throw new BadRequestException("Unsupported image format");
    const data = Buffer.from(match[2], "base64");
    if (data.length === 0 || data.length > 5 * 1024 * 1024)
      throw new BadRequestException("Image must not exceed 5 MB");
    await mkdir(this.directory, { recursive: true });
    const filename = `${prefix}-${randomUUID()}.${extension}`;
    await writeFile(join(this.directory, filename), data);
    return `/media/${filename}`;
  }

  async remove(publicUrl?: string | null): Promise<void> {
    if (!publicUrl?.startsWith("/media/")) return;
    const filename = basename(publicUrl);
    if (!/^(avatar|product)-[a-f0-9-]+\.(jpg|png|webp)$/.test(filename)) return;
    await rm(join(this.directory, filename), { force: true });
  }
}
