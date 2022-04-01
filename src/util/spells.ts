// TODO maybe move the spell exp methods here
// TODO exp scaling should be diffrent for each spell or max level or something
import { PrismaClient } from "@prisma/client";

export const grantSpell = async (
  prisma: PrismaClient,
  playerId: bigint,
  spellId: string
) => {
  await prisma.user.update({
    where: {
      id: playerId,
    },
    data: {
      spells: {
        create: {
          id: spellId,
        },
      },
    },
  });
};
