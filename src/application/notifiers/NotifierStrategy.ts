import type { User } from "../entities/User";

// I + L — uma função só; qualquer canal pode substituir o outro.
export interface NotifierStrategy {
  notify(user: User): Promise<boolean>;
}
