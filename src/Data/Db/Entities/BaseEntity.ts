import crypto from "node:crypto";

export class BaseEntity {
  id: string;
  slug: string;
  createdAt: Date;

  constructor() {
    this.id = crypto.randomUUID();
    this.slug = this.generateSlug();
    this.createdAt = new Date();
  }

  private generateSlug(): string {
    return crypto.randomBytes(10).toString("hex");
  }
}
