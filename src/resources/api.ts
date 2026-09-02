import "dotenv/config";
import { pathToFileURL } from "node:url";
import Fastify from "fastify";
import fastifySwagger from "@fastify/swagger";
import fastifyApiReference from "@scalar/fastify-api-reference";
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from "fastify-type-provider-zod";
import { z } from "zod";
import { CreateUser } from "../application/use-cases/CreateUser";
import {
  EmailAlreadyInUseError,
  FailedToCreateUserError,
  PasswordDoesNotMatchError,
} from "../application/errors";
import { BcryptPasswordHasher } from "./BcryptPasswordHasher";
import { DrizzleUserRepository } from "./DrizzleUserRepository";
import { NotifierStrategyFactory } from "./NotifierStrategyFactory";

export async function buildApp() {
  const app = Fastify().withTypeProvider<ZodTypeProvider>();
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  await app.register(fastifySwagger, {
    openapi: {
      info: {
        title: "Solid Masterclass API",
        description: "User management API",
        version: "1.0.0",
      },
      servers: [{ url: "http://localhost:8080" }],
    },
    transform: jsonSchemaTransform,
  });

  await app.register(fastifyApiReference, {
    routePrefix: "/docs",
    configuration: { theme: "saturn" },
  });

  app.post(
    "/user",
    {
      schema: {
        tags: ["users"],
        summary: "Create a user",
        body: z.object({
          name: z.string(),
          email: z.string().email(),
          age: z.number(),
          password: z.string().min(8),
          passwordConfirmation: z.string().min(8),
          marketingChannel: z.enum(["email", "sms", "whatsapp"]).optional(),
        }),
        response: {
          201: z.object({
            id: z.string(),
            name: z.string(),
            email: z.string(),
            age: z.number(),
          }),
          400: z.object({ error: z.string() }),
          409: z.object({ error: z.string() }),
          500: z.object({ error: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const {
        name,
        email,
        age,
        password,
        passwordConfirmation,
        marketingChannel,
      } = request.body;

      const createUser = new CreateUser(
        new DrizzleUserRepository(),
        new BcryptPasswordHasher(),
        new NotifierStrategyFactory(),
      );

      try {
        const output = await createUser.execute({
          name,
          email,
          age,
          password,
          passwordConfirmation,
          marketingChannel,
        });

        return reply.status(201).send(output);
      } catch (error) {
        if (error instanceof PasswordDoesNotMatchError) {
          return reply.status(400).send({ error: "Passwords do not match" });
        }
        if (error instanceof EmailAlreadyInUseError) {
          return reply.status(409).send({ error: "E-mail já cadastrado" });
        }
        if (error instanceof FailedToCreateUserError) {
          return reply.status(500).send({ error: "Erro ao criar usuário" });
        }
        request.log.error(error);
        return reply.status(500).send({ error: "Erro ao criar usuário" });
      }
    },
  );

  return app;
}

// --- entry ---
const isMain =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const app = await buildApp();
  await app.listen({ port: 8080, host: "0.0.0.0" });
  console.log("Server is running on http://localhost:8080");
  console.log("Docs at http://localhost:8080/docs");
}
