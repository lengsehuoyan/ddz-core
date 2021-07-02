import { Card } from './card';

/**
 * 一副卡牌
 */
export class CardBox {
  private cards: Card[] = [];
  constructor() {
    for (let i = 1; i <= 54; i++) {
      this.cards.push(new Card(i));
    }
  }

  shuffle(): this {
    this.cards = this.cards.sort(() => Math.random() > .5 ? 1 : -1);
    return this;
  }

  split() {
    const cards = this.cards.concat();
    const r = [];
    while (cards.length) {
      r.push(cards.splice(0, Math.min(cards.length, 17)));
    }
    return r;
  }

  getCards() {
    return this.cards;
  }

  static Create(): CardBox {
    return new CardBox();
  }
}
