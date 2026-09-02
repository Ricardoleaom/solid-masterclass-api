import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import request from "supertest";
import { buildApp } from "./resources/api";
import { usersTable } from "./db/schema";
import { db } from "./db/client";
let app: Awaited<ReturnType<typeof buildApp>>;

beforeAll(async () => {
  app = await buildApp();
  await app.ready();
}, 30_000);
afterAll(async () => {
  await app.close();
});

beforeEach(async () => {
  await db.delete(usersTable);
});

const validInput = (overrides: Record<string, unknown> = {}) => ({
  name: "John Doe",
  email: `john_${crypto.randomUUID()}@example.com`,
  age: 30,
  password: "password123",
  passwordConfirmation: "password123",
  ...overrides,
});

describe("POST /user", () => {
  it("deve criar um usuário e retornar 201", async () => {
    const input = validInput();
    const res = await request(app.server).post("/user").send(input);

    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.name).toBe(input.name);
    expect(res.body.email).toBe(input.email);
    expect(res.body.age).toBe(input.age);
    // password never returned
    expect(res.body.password).toBeUndefined();
  });

  it("deve aceitar marketingChannel válido", async () => {
    const input = validInput({ marketingChannel: "email" });
    const res = await request(app.server).post("/user").send(input);

    expect(res.status).toBe(201);
  });

  it("deve persistir um hash bcrypt, não a senha em texto puro", async () => {
    const input = validInput();
    await request(app.server).post("/user").send(input);

    const [row] = await db.select().from(usersTable);
    expect(row?.password).toBeDefined();
    expect(row?.password).not.toBe(input.password);
  });

  it("deve retornar 400 quando as senhas não coincidem", async () => {
    const input = validInput({ passwordConfirmation: "different123" });
    const res = await request(app.server).post("/user").send(input);

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Passwords do not match");
  });

  it("deve retornar 409 quando o e-mail já está em uso", async () => {
    const input = validInput();
    await request(app.server).post("/user").send(input);
    const res = await request(app.server).post("/user").send(input);

    expect(res.status).toBe(409);
    expect(res.body.error).toBe("E-mail já cadastrado");
  });

  it("deve retornar 400 para um e-mail inválido", async () => {
    const res = await request(app.server)
      .post("/user")
      .send(validInput({ email: "not-an-email" }));

    expect(res.status).toBe(400);
  });

  it("deve retornar 400 para uma senha com menos de 8 caracteres", async () => {
    const res = await request(app.server)
      .post("/user")
      .send(validInput({ password: "short", passwordConfirmation: "short" }));

    expect(res.status).toBe(400);
  });

  it("deve retornar 400 quando age não é um número", async () => {
    const res = await request(app.server)
      .post("/user")
      .send(validInput({ age: "thirty" }));

    expect(res.status).toBe(400);
  });

  it("deve retornar 400 para um canal de marketing inválido", async () => {
    const res = await request(app.server)
      .post("/user")
      .send(validInput({ marketingChannel: "carrier-pigeon" }));

    expect(res.status).toBe(400);
  });

  it("deve retornar 400 quando um campo obrigatório está ausente", async () => {
    const { name, ...withoutName } = validInput();
    const res = await request(app.server).post("/user").send(withoutName);

    expect(res.status).toBe(400);
  });
});
