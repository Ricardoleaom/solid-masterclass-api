import { describe, it, expect } from "vitest";
import type { User } from "../application/entities/User";
import type { NotifierStrategy } from "../application/notifiers/NotifierStrategy";
import {
  EmailNotifierStrategy,
  SmsNotifierStrategy,
  WhatsAppNotifierStrategy,
} from "./NotifierGateway";

const minor: User = {
  id: "1",
  name: "João",
  age: 16,
  email: "joao@example.com",
  password: "hash",
};

const adult: User = { ...minor, age: 21 };

describe("NotifierStrategy (Liskov)", () => {
  const strategies: NotifierStrategy[] = [
    new WhatsAppNotifierStrategy(),
    new EmailNotifierStrategy(),
    new SmsNotifierStrategy(),
  ];

  it("todas devolvem boolean e nenhuma lança erro", async () => {
    for (const strategy of strategies) {
      await expect(strategy.notify(minor)).resolves.toBeTypeOf("boolean");
      await expect(strategy.notify(adult)).resolves.toBe(true);
    }
  });
});
