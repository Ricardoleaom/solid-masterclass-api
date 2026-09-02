import type { NotifierStrategy } from "./NotifierStrategy";

// O — um canal novo = nova classe + um case na factory.
export interface NotifierFactory {
  create(channel: string): NotifierStrategy;
}
