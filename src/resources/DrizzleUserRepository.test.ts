import { describe, it, expect } from "vitest";
import { EmailAlreadyInUseError } from "../application/errors";
import { DrizzleUserRepository } from "./DrizzleUserRepository";

const makeUser = (email: string) => ({
  id: crypto.randomUUID(),
  name: "Ana Silva",
  age: 25,
  email,
  password: "hash",
});

describe("DrizzleUserRepository", () => {
  it("traduz o e-mail duplicado do banco em EmailAlreadyInUseError", async () => {
    const repository = new DrizzleUserRepository();
    const email = `ana_${crypto.randomUUID()}@example.com`;

    await repository.create(makeUser(email));

    await expect(repository.create(makeUser(email))).rejects.toBeInstanceOf(
      EmailAlreadyInUseError,
    );
  });
});
