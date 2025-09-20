import crypto from "node:crypto";

export class BaseEntity {
  id: string;
  createdAt: Date;

  constructor() {
    this.id = crypto.randomUUID();
    this.createdAt = new Date();
  }

  private generateSlug(): string {
    return crypto.randomBytes(10).toString("hex");
  }
}
