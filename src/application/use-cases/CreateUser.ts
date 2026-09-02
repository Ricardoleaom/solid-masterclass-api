import {
  EmailAlreadyInUseError,
  FailedToCreateUserError,
  PasswordDoesNotMatchError,
} from "../errors";
import type { UserRepository } from "../repositories/UserRepository";
import type { PasswordHasher } from "../services/PasswordHasher";
import type { NotifierFactory } from "../notifiers/NotifierFactory";

interface InputDto {
  name: string;
  age: number;
  email: string;
  password: string;
  passwordConfirmation: string;
  marketingChannel?: string | null;
}

interface OutputDto {
  id: string;
  name: string;
  email: string;
  age: number;
}

// S — só orquestra o cadastro. HTTP, banco e hash ficam fora.
export class CreateUser {
  constructor(
    private userRepository: UserRepository,
    private passwordHasher: PasswordHasher,
    private notifierFactory: NotifierFactory,
  ) {}

  async execute(input: InputDto): Promise<OutputDto> {
    const {
      name,
      age,
      email,
      password,
      passwordConfirmation,
      marketingChannel,
    } = input;

    if (password !== passwordConfirmation) {
      throw new PasswordDoesNotMatchError();
    }

    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new EmailAlreadyInUseError();
    }

    const user = await this.userRepository.create({
      id: crypto.randomUUID(),
      name,
      age,
      email,
      password: await this.passwordHasher.hash(password),
      marketingChannel,
    });

    if (!user) {
      throw new FailedToCreateUserError();
    }

    if (marketingChannel) {
      await this.notifierFactory.create(marketingChannel).notify(user);
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      age: user.age,
    };
  }
}
