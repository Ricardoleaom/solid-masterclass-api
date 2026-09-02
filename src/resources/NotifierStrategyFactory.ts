import type { NotifierFactory } from "../application/notifiers/NotifierFactory";
import type { NotifierStrategy } from "../application/notifiers/NotifierStrategy";
import {
  EmailNotifierStrategy,
  SmsNotifierStrategy,
  WhatsAppNotifierStrategy,
} from "./NotifierGateway";

export class NotifierStrategyFactory implements NotifierFactory {
  create(channel: string): NotifierStrategy {
    switch (channel) {
      case "whatsapp":
        return new WhatsAppNotifierStrategy();
      case "email":
        return new EmailNotifierStrategy();
      case "sms":
        return new SmsNotifierStrategy();
      default:
        throw new Error(`Invalid channel: ${channel}`);
    }
  }
}
