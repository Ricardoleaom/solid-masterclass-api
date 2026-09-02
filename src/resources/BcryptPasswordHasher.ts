import bcrypt from "bcryptjs";
import type { PasswordHasher } from "../application/services/PasswordHasher";

export class BcryptPasswordHasher implements PasswordHasher {
  hash(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }
}
