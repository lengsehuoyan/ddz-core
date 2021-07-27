import { CardGroupType, CardValue } from '../enums';
import { Card } from '../data/card';
import { CardGroup } from '../data/card-group';

export type CardFinder = (from: CardGroup, target: CardGroup) => number[][];

/**
 * 将卡牌整理成 key => card.value, value => card[] 的map
 * @param cards
 * @returns
 */
export const toValueMap = (cards: Card[]): Map<number, Card[]> => {
  const map = new Map<number, Card[]>();
  cards.forEach((card) => {
    if (!map.has(card.value)) {
      map.set(card.value, []);
    }
    map.get(card.value)?.push(card);
  });
  return map;
};

/**
 * 查找group中的王炸
 * @param group
 * @returns
 */
export const findRocket = (group: CardGroup): number[] => {
  const cards = group.getCards();
  const test = cards.filter((card) => card.value === CardValue.LittleJoker || card.value === CardValue.BigJoker);
  return test.length === 2 ? test.map((card) => card.source) : [];
};

/**
 * 查找大于target的炸弹
 * @param from
 * @param target
 * @returns
 */
export const findBoom = (from: CardGroup, target: CardGroup): number[][] => {
  // if (target.getType() !== CardGroupType.Boom) {
  //   throw new Error('findBoom, 目标类型错误');
  // }
  const r: number[][] = [];
  const fromCards = from.getCards();
  const targetValue = target.getGroupValue().value;
  const fromMap = toValueMap(fromCards);
  fromMap.forEach((cards, value) => {
    if (value > targetValue && cards.length === 4) {
      r.push(cards.map((card) => card.source));
    }
  });
  return r;
};

/**
 * 查找大于target的四带两对
 * @param from
 * @param target
 * @returns
 */
export const findFourTwoDouble = (from: CardGroup, target: CardGroup): number[][] => {
  if (target.getType() !== CardGroupType.Four_TwoDouble) {
    throw new Error('findFourTwoDouble, 目标类型错误');
  }
  const r: number[][] = [];
  const fromCards = from.getCards();
  if (fromCards.length < 8) {
    return r;
  }
  const targetValue = target.getGroupValue().value;
  const fromMap = toValueMap(fromCards);
  const four: number[][] = [];
  const two: number[][] = [];
  fromMap.forEach((cards, value) => {
    if (value > targetValue && cards.length === 4) {
      four.push(cards.map((card) => card.source));
    } else if (cards.length >= 2) {
      two.push(cards.map((card) => card.source).slice(0, 2));
    }
  });
  if (two.length < 2) {
    return r;
  }
  if (four.length && two.length) {
    const temp: number[] = [];
    for (let i = 0; i < two.length - 1; i++) {
      for (let j = i + 1; j < two.length; j++) {
        temp.push(...two[i], ...two[j]);
      }
    }
    four.forEach((fv) => {
      temp.forEach((tv) => {
        r.push(fv.concat(tv));
      });
    });
  }
  return r;
};

/**
 * 查找岛屿target的四带二
 * @param from
 * @param target
 * @returns
 */
export const findFourTwo = (from: CardGroup, target: CardGroup): number[][] => {
  if (target.getType() !== CardGroupType.Four_Two) {
    throw new Error('findFourTwo, 目标类型错误');
  }
  const r: number[][] = [];
  const fromCards = from.getCards();
  if (fromCards.length < 6) {
    return r;
  }
  const targetValue = target.getGroupValue().value;
  const fromMap = toValueMap(fromCards);
  const four: number[][] = [];
  const two: number[][] = [];
  fromMap.forEach((cards, value) => {
    if (value > targetValue && cards.length === 4) {
      four.push(cards.map((card) => card.source));
    } else if (cards.length >= 2) {
      two.push(cards.map((card) => card.source).slice(0, 2));
    }
  });
  if (two.length < 2) {
    return r;
  }
  if (four.length && two.length) {
    four.forEach((fv) => {
      two.forEach((tv) => {
        r.push(fv.concat(tv));
      });
    });
  }
  return r;
};

/**
 * 查找大于target的飞机带翅膀
 * // 6+2, 6+4, 9+3, 9+6, 12+4, 12+8
 * @param from
 * @param target
 */
export const findThreeJunkoWing = (from: CardGroup, target: CardGroup): number[][] => {
  if (target.getType() !== CardGroupType.ThreeJunkoWing) {
    throw new Error('findThreeJunkoWing, 目标类型错误');
  }
  const r: number[][] = [];
  const fromCards = from.getCards();
  const targetCards = target.getCards();
  const valueObj = target.getGroupValue();
  if (fromCards.length < valueObj.len) {
    return r;
  }
  const fromMap = toValueMap(fromCards);
  const targetMap = toValueMap(targetCards);
  if (fromCards.length < valueObj.len) {
    return r;
  }
  const junkoPart: Card[] = [];
  targetMap.forEach((cards, v) => {
    if (cards.length >= 3) {
      junkoPart.push(...cards.slice(0, 3));
    }
  });
  const isSingleWing = valueObj.len % 4 === 0;
  const isDoubleWing = valueObj.len % 5 === 0;
  const junkos = _findJunko(from, new CardGroup(junkoPart), 3);
  const junkoGroups = junkos.map((v) => new CardGroup(v));
  const sampleLen = isSingleWing ? 1 : isDoubleWing ? 2 : -1;
  if (sampleLen === -1) {
    throw new Error(`findThreeJunkoWing, 目标类型错误 ${target.getCards().map((card) => card.source)} ${valueObj.len}`);
  } else {
    // 按飞机为组递归
    junkoGroups.forEach((junkoGroup) => {
      const junkoGroupCards = junkoGroup.getCards();
      const junkoGroupNumbers = junkoGroupCards.map((card) => card.source);
      const samples: number[][] = [];
      fromMap.forEach((cards) => {
        if (cards?.length) {
          // 查找飞机内不包含的卡片作为样本
          const sample = cards.filter((card) => {
            return !!junkoGroupNumbers.includes(card.source);
          });
          if (sample && sample.length >= sampleLen - 1) {
            samples.push(sample.slice(0, sampleLen).map((card) => card.source));
          }
        }
      });
      const wingArr = [];
      if (samples.length >= 2) {
        for (let i = 0; i < samples.length - 1; i++) {
          for (let j = i + 1; j < samples.length; j++) {
            wingArr.push([samples[i], samples[j]]);
          }
        }
        wingArr.forEach((wings) => {
          r.push(junkoGroupNumbers.concat(...wings));
        });
      }
    });
  }
  return r;
};

export const findThreeJunko = (from: CardGroup, target: CardGroup): number[][] => {
  if (target.getType() !== CardGroupType.DoubleJunko) {
    throw new Error('findDoubleJunko, 目标类型错误');
  }
  return _findJunko(from, target, 3);
};

export const findDoubleJunko = (from: CardGroup, target: CardGroup): number[][] => {
  if (target.getType() !== CardGroupType.DoubleJunko) {
    throw new Error('findDoubleJunko, 目标类型错误');
  }
  return _findJunko(from, target, 2);
};

export const findJunko = (from: CardGroup, target: CardGroup, junkoSize = 1): number[][] => {
  if (target.getType() !== CardGroupType.Junko) {
    throw new Error('findJunko, 目标类型错误');
  }
  return _findJunko(from, target, 1);
};

export const _findJunko = (from: CardGroup, target: CardGroup, junkoSize: number): number[][] => {
  const r: number[][] = [];
  const fromCards = from.getCards();
  const SIZE = [5, 6, 9];
  if (fromCards.length < 5 * SIZE[junkoSize - 1]) {
    return r;
  }
  const valueObj = target.getGroupValue();
  const targetValue = valueObj.value;
  if (targetValue === CardValue.A) {
    return r;
  }
  const fromMap = toValueMap(fromCards);
  if (fromMap.size < valueObj.len / junkoSize) {
    return r;
  }
  const keys = [
    CardValue.A,
    CardValue.K,
    CardValue.Q,
    CardValue.J,
    CardValue.Ten,
    CardValue.Nine,
    CardValue.Eight,
    CardValue.Seven,
  ];
  keys.forEach((kv) => {
    if (kv > valueObj.value) {
      let flag = true;
      const arr: number[] = [];
      for (let i = 0; i < valueObj.len / junkoSize; i++) {
        const v = kv - i;
        if (fromMap.has(v) && v > targetValue) {
          const cards = fromMap.get(v);
          if (cards && cards.length >= junkoSize) {
            arr.unshift(...cards.map((card) => card.source).slice(0, junkoSize));
          } else {
            flag = false;
          }
        } else {
          flag = false;
          break;
        }
      }
      if (flag && arr.length === valueObj.len) {
        r.push(arr);
      }
    }
  });
  return r;
};

export const findThreeTwo = (from: CardGroup, target: CardGroup): number[][] => {
  if (target.getType() !== CardGroupType.Three_Two) {
    throw new Error('findThreeTwo, 目标类型错误');
  }
  const r: number[][] = [];
  const fromCards = from.getCards();
  if (fromCards.length < 5) {
    return r;
  }
  const targetValue = target.getGroupValue().value;
  const fromMap = toValueMap(fromCards);
  const three: number[][] = [];
  const two: number[][] = [];
  fromMap.forEach((cards: Card[], value: number) => {
    if (value > targetValue && cards.length >= 3) {
      three.push(cards.map((card) => card.source).slice(0, 3));
    }
    if (cards.length >= 2) {
      two.push(cards.map((card) => card.source).slice(0, 2));
    }
  });
  if (three.length && two.length) {
    three.forEach((v1) => {
      two.forEach((v2) => {
        r.push(v1.concat(v2));
      });
    });
  }
  return r;
};

export const findThreeOne = (from: CardGroup, target: CardGroup): number[][] => {
  if (target.getType() !== CardGroupType.Three_One) {
    throw new Error('findThree, 目标类型错误');
  }
  const r: number[][] = [];
  const fromCards = from.getCards();
  if (fromCards.length < 4) {
    return r;
  }
  const targetValue = target.getGroupValue().value;
  const fromMap = toValueMap(fromCards);
  const three: number[][] = [];
  const one: number[] = [];
  fromMap.forEach((cards: Card[], value: number) => {
    if (value > targetValue && cards.length >= 3) {
      three.push(cards.map((card) => card.source).slice(0, 3));
    }
    if (cards.length !== 3) {
      one.push(cards[0].source);
    }
  });
  if (three.length && one.length) {
    three.forEach((tv) => {
      one.forEach((ov) => {
        r.push(tv.concat(ov));
      });
    });
  }
  return r;
};

export const findThree = (from: CardGroup, target: CardGroup): number[][] => {
  if (target.getType() !== CardGroupType.Three) {
    throw new Error('findThree, 目标类型错误');
  }
  return findMutile(from, target, 3);
};

export const findDouble = (from: CardGroup, target: CardGroup): number[][] => {
  if (target.getType() !== CardGroupType.Double) {
    throw new Error('findDouble, 目标类型错误');
  }
  return findMutile(from, target, 2);
};

export const findSignle = (from: CardGroup, target: CardGroup): number[][] => {
  if (target.getType() !== CardGroupType.Single) {
    throw new Error('findSignle, 目标类型错误');
  }
  return findMutile(from, target, 1);
};

export const findMutile = (from: CardGroup, target: CardGroup, size: number = 1): number[][] => {
  const r: number[][] = [];
  const fromCards = from.getCards();
  if (fromCards.length < size) {
    return r;
  }
  const targetValue = target.getGroupValue().value;
  const fromMap = toValueMap(fromCards);
  fromMap.forEach((cards: Card[], value: number) => {
    if (value > targetValue && cards.length >= size) {
      r.push(cards.map((card) => card.source).slice(0, size));
    }
  });
  return r;
};

export const moreThan = (from: CardGroup, target: CardGroup): number[][] => {
  let finder: CardFinder | undefined;
  switch (target.getType()) {
    case CardGroupType.Mess:
    case CardGroupType.Rocket:
      return [];
    case CardGroupType.Boom:
      finder = undefined;
      break;
    case CardGroupType.Single:
      finder = findSignle;
      break;
    case CardGroupType.Double:
      finder = findDouble;
      break;
    case CardGroupType.Three:
      finder = findThree;
      break;
    case CardGroupType.Three_One:
      finder = findThreeOne;
      break;
    case CardGroupType.Three_Two:
      finder = findThreeTwo;
      break;
    case CardGroupType.Junko:
      finder = findJunko;
      break;
    case CardGroupType.DoubleJunko:
      finder = findDoubleJunko;
      break;
    case CardGroupType.ThreeJunko:
      finder = findThreeJunko;
      break;
    case CardGroupType.ThreeJunkoWing:
      finder = findThreeJunkoWing;
      break;
    case CardGroupType.Four_Two:
      finder = findFourTwo;
      break;
    case CardGroupType.Four_TwoDouble:
      finder = findFourTwoDouble;
      break;
    default:
      break;
  }
  const r = [];
  if (typeof finder === 'function') {
    const tr = finder(from, target);
    if (tr.length) {
      r.push(...tr);
    }
  }
  const boom = findBoom(from, target);
  if (boom.length) {
    r.push(...boom);
  }
  const rocket = findRocket(from);
  if (rocket.length) {
    r.push(rocket);
  }
  return r;
};
