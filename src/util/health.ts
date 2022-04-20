export const hpToDmgRes = (targetHealth: number) => -(1 - 100 / targetHealth);

export const levelToHp = (level: number) => 100 + level ** 1.5;

export const levelToDmgRes = (level: number) => hpToDmgRes(levelToHp(level));
