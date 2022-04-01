import { PrismaClient } from "@prisma/client";
import prisma from "../prisma";
import { spells } from "../spells";
// TODO maybe make it reuturn a boolean as an error or something
// 10x + 1.1x^2
// should average 50 exp/min at end game

export const MAX_LEVEL = 100;
export const MAX_PLAYER_EXPERIENCE = 410_685;

export const MAX_SPELL_LEVEL = 50;
export const MAX_SPELL_EXPERIENCE = 16_231.25;

export const expForLevelPlayer = (level: number) =>
  10 * level + 1.1 * level ** 2;

export const totalExpForLevelPlayer = (level: number) => {
  let total = 0;
  for (let i = 1; i <= level; i++) total += expForLevelPlayer(i);
  return total;
};

export const totalExpForLevelSpell = (spellId: string, level: number) => {
  let total = 0;
  for (let i = 1; i <= level; i++) total += spells.get(spellId).scaling(i);
  return total;
};

export const expProgressLevelPlayer = (level: number, exp: number) =>
  expForLevelPlayer(level) - (totalExpForLevelPlayer(level) - exp);

export const expProgressLevelSpell = (
  spellId: string,
  level: number,
  exp: number
) =>
  spells.get(spellId).scaling(level) -
  (totalExpForLevelSpell(spellId, level) - exp);

export const grantPlayerExp = async (
  prisma: PrismaClient,
  userId: bigint,
  exp: number
) => {
  const player = await prisma.user.findUnique({ where: { id: userId } });
  const newExperience = Math.min(
    player.experience + exp,
    MAX_PLAYER_EXPERIENCE
  );
  let levelUp = 0;
  while (newExperience >= totalExpForLevelPlayer(player.level + levelUp))
    levelUp++;
  const newLevel = player.level + levelUp;
  await prisma.user.update({
    where: { id: userId },
    data: { experience: newExperience, level: newLevel },
  });

  return levelUp;
};

export const grantSpellExp = async (
  prisma: PrismaClient,
  userId: bigint,
  spellId: string,
  exp: number
) => {
  const player = await prisma.user.findUnique({
    where: { id: userId },
    include: { spells: true },
  });
  const spell = player.spells.find((spell) => spell.id === spellId);
  const spellData = spells.get(spellId);
  if (spell === null) return;

  const newExperience = Math.min(spell.experience + exp, MAX_SPELL_EXPERIENCE);

  let levelUp = 0;

  while (newExperience >= totalExpForLevelSpell(spellId, spell.level + levelUp))
    levelUp++;

  const newLevel = spell.level + levelUp;

  await prisma.spell.update({
    where: { id_ownerId: { id: spellId, ownerId: userId } },
    data: {
      experience: newExperience,
      level: newLevel,
    },
  });

  return levelUp;
};
