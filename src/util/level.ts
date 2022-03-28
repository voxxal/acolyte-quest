import prisma from "../prisma";

// 10x + 1.1x^2
// should average 50 exp/min at end game

export const expForLevel = (level: number) => (10 * level) + 1.1 * (level ** 2);