// D — trocar bcrypt por outra lib não mexe no CreateUser.
export interface PasswordHasher {
  hash(password: string): Promise<string>;
}
