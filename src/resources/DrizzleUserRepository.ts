import { eq } from "drizzle-orm";
import { db } from "../db/client";
import { usersTable } from "../db/schema";
import type { User } from "../application/entities/User";
import type { UserRepository } from "../application/repositories/UserRepository";

export class DrizzleUserRepository implements UserRepository {
  async create(input: User): Promise<User | null> {
    const [user] = await db.insert(usersTable).values(input).returning();
    if (!user) {
      return null;
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));
    if (!user) {
      return null;
    }
    return user;
  }
}
