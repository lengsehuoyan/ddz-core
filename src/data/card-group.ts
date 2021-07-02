import { CardGroupHelper } from '../logic';
import { CardGroupType, CardGroupTypeValue } from '../enums';
import { Card } from './card';

export type CompareResult = 1 | -1 | typeof NaN;
export interface CGValueObj {
  typeValue: CardGroupTypeValue;
  len: number;
  value: number;
}

/**
 * 一组牌
 */
export class CardGroup {
  private cards: Card[];
  private type: CardGroupType;
  private groupValue: CGValueObj;

  constructor(cards: Card[]) {
    this.cards = cards.sort(CardGroup.sort);
    this.type = CardGroupHelper.GetCardGroupType(this);
    this.groupValue = CardGroupHelper.GetCardGroupValueObj(this);
  }

  compare(target: CardGroup): CompareResult {
    return CardGroup.compare(this, target);
  }

  getGroupValue(): CGValueObj {
    return this.groupValue;
  }

  getType(): CardGroupType {
    return this.type;
  }

  getCards(): Card[] {
    return this.cards;
  }

  getValues(): number[] {
    return this.cards.map((c) => c.value);
  }

  /**
   * @param card1
   * @param card2
   */
  static sort(card1: Card, card2: Card) {
    return card1.value - card2.value || card1.suit - card2.suit;
  }

  /**
   * 对比两组牌的大小
   * @param cg1
   * @param cg2
   *
   * @returns 如果cg1大于cg2 则返回 1 ， 如果cg1小于或者等于cg2 则返回 - 1， 如果两个牌型无法比较 则返回NaN
   */
  static compare(cg1: CardGroup, cg2: CardGroup): CompareResult {
    const v1 = cg1.getGroupValue();
    const v2 = cg2.getGroupValue();
    if (v1.typeValue === CardGroupTypeValue.Mess || v2.typeValue === CardGroupTypeValue.Mess) return NaN;
    if (v1.typeValue === v2.typeValue) {
      return v1.len === v2.len ? (v1.value > v2.value ? 1 : -1) : NaN;
    }
    return v1.typeValue > v2.typeValue ? 1 : -1;
  }
}
