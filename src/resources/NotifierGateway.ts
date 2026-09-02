import type { User } from "../application/entities/User";
import type { NotifierStrategy } from "../application/notifiers/NotifierStrategy";

// L — as três classes se comportam igual: nunca lançam, só dizem se notificou.
export class WhatsAppNotifierStrategy implements NotifierStrategy {
  async notify(user: User): Promise<boolean> {
    console.log(`Notifying ${user.name} via WhatsApp`);
    return true;
  }
}

export class EmailNotifierStrategy implements NotifierStrategy {
  async notify(user: User): Promise<boolean> {
    console.log(`Notifying ${user.name} via Email`);
    if (user.age < 18) {
      return false;
    }
    return true;
  }
}

export class SmsNotifierStrategy implements NotifierStrategy {
  async notify(user: User): Promise<boolean> {
    console.log(`Notifying ${user.name} via SMS`);
    if (user.age < 18) {
      return false;
    }
    return true;
  }
}
