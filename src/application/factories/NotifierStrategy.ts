import {
  EmailNotifierStrategy,
  NotifierStrategy,
  SmsNotifierStrategy,
  WhatsAppNotifierStrategy,
} from "../../resources/NotifierGateway";

export class NotifierStrategyFactory {
  static create(channel: string): NotifierStrategy {
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
