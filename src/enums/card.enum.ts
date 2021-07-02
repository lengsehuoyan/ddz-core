export enum CardValue {
  J = 11,
  Q = 12,
  K = 13,
  A = 14,
  Er = 15,
  LittleJoker = 16,
  BigJoker = 17,
}

/**
 * 花色
 */
export enum CardSuit {
  Undefined = -1,
  club = 0, // 梅花
  Diamond, // 方块
  Heart, // 红桃
  Spade, // 黑桃
  LittleJoker = 52,
  BigJoker = 53,
}

/**
 * 牌型值
 */
export enum CardGroupTypeValue {
  Mess = -1, // 无意义牌型
  Other = 0,
  Boom = 1, // 炸
  Rocket = 2, // 王炸
}

/**
 * 牌型类型
 */
export enum CardGroupType {
  Mess = 0, // 杂牌
  Single = 1, // 单张
  Double = 2, // 一对
  Three = 3, // 三张
  Three_One = 4, // 三带一
  Three_Two = 5, // 三带二
  Junko = 6, // 顺子
  DoubleJunko = 7, // 双顺
  ThreeJunko = 8, // 三顺 飞机不带翅膀
  ThreeJunkoWing = 9, // 飞机带翅膀
  Four_Two = 10, // 四带二
  Four_TwoDouble = 11, // 四带一对
  Boom = 12, // 炸
  Rocket = 13, // 王炸
}
