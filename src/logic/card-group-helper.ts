import { Card, CardGroup, CGValueObj } from '../data';
import { CardGroupType, CardGroupTypeValue, CardValue } from '../enums';

export class CardGroupHelper {
  static GetCardGroupType(group: CardGroup): CardGroupType {
    if (this.isRocket(group)) return CardGroupType.Rocket;
    if (this.isBoom(group)) return CardGroupType.Boom;
    if (this.isSingle(group)) return CardGroupType.Single;
    if (this.isDouble(group)) return CardGroupType.Double;
    if (this.isThree(group)) return CardGroupType.Three;
    if (this.isThreeOne(group)) return CardGroupType.Three_One;
    if (this.isThreeTwo(group)) return CardGroupType.Three_Two;
    if (this.isJunko(group)) return CardGroupType.Junko;
    if (this.isDoubleJunko(group)) return CardGroupType.DoubleJunko;
    if (this.isThreeJunko(group)) return CardGroupType.ThreeJunko;
    if (this.isThreeJunkoWing(group)) return CardGroupType.ThreeJunkoWing;
    if (this.isFourTwo(group)) return CardGroupType.Four_Two;
    if (this.isFourDoubleTwo(group)) return CardGroupType.Four_TwoDouble;
    return CardGroupType.Mess;
  }

  static GetCardGroupValueObj(group: CardGroup): CGValueObj {
    const valueObj: CGValueObj = {} as CGValueObj;
    const values = group.getValues();
    const lastvalue = values[values.length - 1];
    valueObj.len = values.length;
    switch (group.getType()) {
      case CardGroupType.Mess:
        valueObj.typeValue = CardGroupTypeValue.Rocket;
        break;
      case CardGroupType.Rocket:
        valueObj.typeValue = CardGroupTypeValue.Rocket;
        valueObj.value = lastvalue;
        break;
      case CardGroupType.Boom:
        valueObj.typeValue = CardGroupTypeValue.Boom;
        valueObj.value = lastvalue;
        break;
      case CardGroupType.Three_One:
      case CardGroupType.Three_Two:
        {
          const map = this.MapCards(group);
          const [main] = this.SplitMap(map, 3);
          valueObj.typeValue = CardGroupTypeValue.Other;
          valueObj.value = main[main.length - 1].value;
        }
        break;
      case CardGroupType.Four_Two:
      case CardGroupType.Four_TwoDouble:
        {
          const map = this.MapCards(group);
          const [main] = this.SplitMap(map, 4);
          valueObj.typeValue = CardGroupTypeValue.Other;
          valueObj.value = main[main.length - 1].value;
        }
        break;
      default:
        valueObj.typeValue = CardGroupTypeValue.Other;
        valueObj.value = lastvalue;
    }
    return valueObj;
  }

  static MapCards(group: CardGroup): Map<number, Card[]> {
    const cards = group.getCards();
    const map = new Map<number, Card[]>();
    cards.forEach((card) => {
      if (!map.has(card.value)) {
        map.set(card.value, []);
      }
      map.get(card.value)?.push(card);
    });
    return map;
  }

  static SplitMap(map: Map<number, Card[]>, byNum: number): [Card[], Card[]] {
    const cards1: Card[] = [];
    const cards2: Card[] = [];
    map.forEach((arr) => {
      arr = arr.concat();
      if (arr.length >= byNum) {
        cards1.push(...arr.splice(0, byNum));
        if (arr.length) {
          cards2.push(...arr);
        }
      } else {
        cards2.push(...arr);
      }
    });
    return [cards1, cards2];
  }

  static CountValue(group: CardGroup, n: number): number {
    const values = group.getValues();
    let count = 0;
    values.forEach((v) => {
      if (v === n) count++;
    });
    return count;
  }

  static isSameValues(group: CardGroup): boolean {
    const values = group.getValues();
    const v0 = values[0];
    return values.every((v) => v === v0);
  }

  /**
   * 是否多张顺子
   * @param group
   * @param n 顺子基数
   * @returns
   */
  static isMultiJunko(group: CardGroup, n: number): boolean {
    const cards = group.getCards();
    if (cards.length < n * 3 || cards.length % n !== 0) return false;
    const split: Card[][] = [];
    for (let i = 0; i < n; i++) split.push([]);
    cards.forEach((card, i) => {
      const m = i % n;
      split[m].push(card);
    });
    const baseGroup = new CardGroup(split[0]);
    if (!this.isIncreaseDegrees(baseGroup, n)) return false;
    const baseValues = baseGroup.getValues();
    for (let i = 1; i < split.length; i++) {
      const tempGroup = new CardGroup(split[i]);
      const tempValues = tempGroup.getValues();
      if (tempValues.some((v, k) => baseValues[k] !== v)) {
        return false;
      }
    }
    return true;
  }

  /**
   * 是否符合递增规则 3 - A
   * @param group
   * @param minLen 至少有minLen张牌符合递增
   * @returns
   */
  static isIncreaseDegrees(group: CardGroup, minLen: number): boolean {
    const values = group.getValues();
    if (values.length < minLen) return false;
    if (values.some((v) => v >= CardValue.A)) return false;
    let f = true;
    values.reduce((p, c) => {
      if (c !== p + 1) {
        f = false;
      }
      return c;
    });
    return f;
  }

  /**
   * 单张判定
   * @param group
   * @returns
   */
  static isSingle(group: CardGroup): boolean {
    return group.getCards().length === 1;
  }

  /**
   * 对张判定
   * @param group
   * @returns
   */
  static isDouble(group: CardGroup): boolean {
    const values = group.getValues();
    if (values.length !== 2) return false;
    const [v1, v2] = values;
    return v1 === v2;
  }

  /**
   * 王炸判定
   * @param group
   * @returns
   */
  static isRocket(group: CardGroup): boolean {
    const values = group.getValues();
    if (values.length !== 2) return false;
    const [v1, v2] = values;
    return v1 === CardValue.LittleJoker && v2 === CardValue.BigJoker;
  }

  /**
   * 三张判定
   * @param group
   * @returns
   */
  static isThree(group: CardGroup): boolean {
    return group.getCards().length === 3 && this.isSameValues(group);
  }

  /**
   * 炸弹判定
   * @param group
   * @returns
   */
  static isBoom(group: CardGroup): boolean {
    return group.getCards().length === 4 && this.isSameValues(group);
  }

  /**
   * 三带一判定
   * @param group
   * @returns
   */
  static isThreeOne(group: CardGroup): boolean {
    const values = group.getValues();
    if (values.length !== 4) return false;
    const [v1, v2] = values;
    return this.CountValue(group, v1) === 3 || this.CountValue(group, v2) === 3;
  }

  /**
   * 三代二判定
   * @param group
   * @returns
   */
  static isThreeTwo(group: CardGroup): boolean {
    const values = group.getValues();
    if (values.length !== 5) return false;
    const f = values[0];
    const e = values[values.length - 1];
    return (
      (this.CountValue(group, f) === 3 && this.CountValue(group, e) === 2) ||
      (this.CountValue(group, f) === 2 && this.CountValue(group, e) === 3)
    );
  }

  /**
   * 顺子判定
   * @param group
   * @returns
   */
  static isJunko(group: CardGroup): boolean {
    return this.isIncreaseDegrees(group, 5);
  }

  /**
   * 双顺子判定
   * @param group
   * @returns
   */
  static isDoubleJunko(group: CardGroup): boolean {
    return this.isMultiJunko(group, 2);
  }

  /**
   * 三顺子判定
   * @param group
   * @returns
   */
  static isThreeJunko(group: CardGroup): boolean {
    return this.isMultiJunko(group, 3);
  }

  /**
   * 飞机带翅膀判定
   * @param group
   */
  static isThreeJunkoWing(group: CardGroup): boolean {
    const cards = group.getCards();
    const len = cards.length;
    if (len < 8) return false;
    // 6+2, 6+4, 9+3, 9+6, 12+4, 12+8
    if (len % 4 !== 0 || len % 5 !== 0) return false;
    const map = this.MapCards(group);
    // 拆分成飞机部分和翅膀部分
    const [junko, wing] = this.SplitMap(map, 3);
    if (!this.isThreeJunko(new CardGroup(junko))) return false;
    // 带单张
    if (len % 4 === 0) return true;
    // 带对子
    if (len % 5 === 0) {
      const wingGroup = new CardGroup(wing);
      const wingValues = wingGroup.getValues();
      let f = true;
      for (let i = 0; i < wingValues.length / 2; i++) {
        if (wingValues[i] !== wingValues[i + 1]) {
          f = false;
          break;
        }
      }
      return f;
    }
    return false;
  }

  /**
   * 判定四带二
   * @param group
   * @returns
   */
  static isFourTwo(group: CardGroup): boolean {
    const values = group.getValues();
    if (values.length !== 6) return false;
    const f = values[0];
    const e = values[values.length - 1];
    return (
      (this.CountValue(group, f) === 4 && this.CountValue(group, e) === 2) ||
      (this.CountValue(group, f) === 2 && this.CountValue(group, e) === 4)
    );
  }

  /**
   * 四带二对
   * @param group
   * @returns
   */
  static isFourDoubleTwo(group: CardGroup): boolean {
    const cards = group.getCards();
    if (cards.length !== 8) return false;
    const map = this.MapCards(group);
    // 拆分成飞机部分和翅膀部分
    const [four, other] = this.SplitMap(map, 4);
    if (!this.isBoom(new CardGroup(four))) return false;
    const otherGroup = new CardGroup(other);
    const otherValues = otherGroup.getValues();
    let f = true;
    for (let i = 0; i < otherValues.length / 2; i++) {
      if (otherValues[i] !== otherValues[i + 1]) {
        f = false;
        break;
      }
    }
    return f;
  }
}
