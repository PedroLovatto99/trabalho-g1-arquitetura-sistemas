import crypto from "node:crypto";

export class BaseEntity {
  id: string;
  slug: string;
  createdAt: Date;

  constructor(props?: { id?: string; slug?: string; createdAt?: Date }) {
    this.id = props?.id ?? crypto.randomUUID();
    this.slug = props?.slug ?? this.generateSlug(); 
    this.createdAt = props?.createdAt ?? new Date();
  }

  private generateSlug(): string {
    return crypto.randomBytes(10).toString("hex");
  }
}