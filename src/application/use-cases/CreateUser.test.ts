import { describe, it, expect } from "vitest";
import { CreateUser } from "./CreateUser";
import {
  EmailAlreadyInUseError,
  FailedToCreateUserError,
  PasswordDoesNotMatchError,
} from "../errors";
import type { User } from "../entities/User";
import type { UserRepository } from "../repositories/UserRepository";
import type { PasswordHasher } from "../services/PasswordHasher";
import type { NotifierFactory } from "../notifiers/NotifierFactory";

function makeHasher(): PasswordHasher {
  return {
    hash: async (password) => `hashed:${password}`,
  };
}

function makeRepository(seed: User[] = []): UserRepository & { users: User[] } {
  const users = [...seed];
  return {
    users,
    async findByEmail(email) {
      return users.find((user) => user.email === email) ?? null;
    },
    async create(input) {
      users.push(input);
      return input;
    },
  };
}

function makeNotifierFactory() {
  const calls: { channel: string; email: string }[] = [];
  const factory: NotifierFactory = {
    create(channel) {
      return {
        async notify(user) {
          calls.push({ channel, email: user.email });
          return true;
        },
      };
    },
  };
  return { factory, calls };
}

const validInput = {
  name: "Ana Silva",
  age: 25,
  email: "ana@example.com",
  password: "password123",
  passwordConfirmation: "password123",
};

describe("CreateUser", () => {
  it("cria o usuário e não devolve a senha", async () => {
    const repository = makeRepository();
    const createUser = new CreateUser(
      repository,
      makeHasher(),
      makeNotifierFactory().factory,
    );

    const output = await createUser.execute(validInput);

    expect(output.id).toBeDefined();
    expect(output.name).toBe("Ana Silva");
    expect(output.email).toBe("ana@example.com");
    expect(output.age).toBe(25);
    expect(output).not.toHaveProperty("password");
  });

  it("grava a senha hasheada, não o texto puro", async () => {
    const repository = makeRepository();
    const createUser = new CreateUser(
      repository,
      makeHasher(),
      makeNotifierFactory().factory,
    );

    await createUser.execute(validInput);

    expect(repository.users[0]?.password).toBe("hashed:password123");
  });

  it("recusa quando as senhas não coincidem", async () => {
    const createUser = new CreateUser(
      makeRepository(),
      makeHasher(),
      makeNotifierFactory().factory,
    );

    await expect(
      createUser.execute({
        ...validInput,
        passwordConfirmation: "outra-senha",
      }),
    ).rejects.toBeInstanceOf(PasswordDoesNotMatchError);
  });

  it("recusa e-mail já cadastrado", async () => {
    const createUser = new CreateUser(
      makeRepository([
        {
          id: "1",
          name: "Outra",
          age: 20,
          email: "ana@example.com",
          password: "hash",
        },
      ]),
      makeHasher(),
      makeNotifierFactory().factory,
    );

    await expect(createUser.execute(validInput)).rejects.toBeInstanceOf(
      EmailAlreadyInUseError,
    );
  });

  it("notifica só quando existe canal de marketing", async () => {
    const withChannel = makeNotifierFactory();
    const withoutChannel = makeNotifierFactory();

    await new CreateUser(
      makeRepository(),
      makeHasher(),
      withChannel.factory,
    ).execute({ ...validInput, marketingChannel: "email" });

    await new CreateUser(
      makeRepository(),
      makeHasher(),
      withoutChannel.factory,
    ).execute(validInput);

    expect(withChannel.calls).toEqual([
      { channel: "email", email: "ana@example.com" },
    ]);
    expect(withoutChannel.calls).toEqual([]);
  });

  it("falha se o repositório não persistir o usuário", async () => {
    const repository: UserRepository = {
      findByEmail: async () => null,
      create: async () => null,
    };

    const createUser = new CreateUser(
      repository,
      makeHasher(),
      makeNotifierFactory().factory,
    );

    await expect(createUser.execute(validInput)).rejects.toBeInstanceOf(
      FailedToCreateUserError,
    );
  });
});
