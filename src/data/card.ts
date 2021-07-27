import { CardSuit, CardValue } from '../enums';

/**
 * 扑克
 */
export class Card {
  // 1-54
  source: number;

  constructor(source: number) {
    this.source = source;
  }

  /**
   * 单张牌面数值 用于比较大小
   * 3=3,4=4,...,j=11,q=12,k=13,A=14,2=15,little-joker=16,big-joker=17
   */
  get value(): number {
    switch (this.source) {
      case 53:
        return CardValue.LittleJoker;
      case 54:
        return CardValue.BigJoker;
      default:
        const n = this.source % 13;
        if (n >= 3) return n;
        return n + 13;
    }
  }

  /**
   * 用于显示
   * 1-15 A=1,2=2,...j=11,q=12,k=13,little-joker=14,big-joker=15
   * @param showSuit 是否显示花色 最终不影响LITTLE-JOKER, BIG-JOKER
   */
  display(showSuit: boolean): string {
    const CHARS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    switch (this.source) {
      case 53:
        return 'LITTLE-JOKER';
      case 54:
        return 'BIG-JOKER';
      default:
        const n = (this.source - 1) % 13;
        return showSuit ? `${CardSuit[this.suit]}-${CHARS[n]}` : CHARS[n];
    }
  }

  /**
   * 花色
   */
  get suit(): CardSuit {
    if (this.source) return Math.floor((this.source - 1) / 13);
    return CardSuit.Undefined;
  }

  toString(): string {
    return `${this.display(true)}, value = ${this.value}`;
  }
}
