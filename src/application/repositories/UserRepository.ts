import type { User } from "../entities/User";

// D — o caso de uso depende desta interface, não do Drizzle.
export interface UserRepository {
  create(input: User): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
}
