import { Card, CardGroup } from './data';
import { CardBox } from './data/card-box';

export * from './data';
export * from './enums';
export * from './logic';

// const cards = [];
// for (let i = 1; i <= 54; i++) {
//   const card = new Card(i);
//   cards.push(card);
// }

// cards.forEach(card => console.log(card.toString()));
const box = CardBox.Create();
const r = box.shuffle().split();
// const groups = r.map((cards) => new CardGroup(cards));
// groups.forEach((group) => console.log(group));

const groups = [new CardGroup([new Card(1), new Card(14), new Card(27), new Card(40)])];
groups.forEach((group) => console.log(group));