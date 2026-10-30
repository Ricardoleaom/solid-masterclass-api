import { eq } from "drizzle-orm";
import { db } from "../db/client";
import { usersTable } from "../db/schema";
import type { User } from "../application/entities/User";
import { EmailAlreadyInUseError } from "../application/errors";
import type { UserRepository } from "../application/repositories/UserRepository";

export class DrizzleUserRepository implements UserRepository {
  async create(input: User): Promise<User | null> {
    // O findByEmail do CreateUser não segura duas requisições simultâneas;
    // quem garante o e-mail único é o banco, e o adaptador traduz o conflito
    // no erro que a aplicação já conhece.
    const [user] = await db
      .insert(usersTable)
      .values(input)
      .onConflictDoNothing({ target: usersTable.email })
      .returning();
    if (!user) {
      throw new EmailAlreadyInUseError();
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
