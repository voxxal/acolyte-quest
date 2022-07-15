import { big, bow, dagger, small } from "./spells/goblinHideout";
import { safe } from "./spells/generic/safe";

type Subset<K> = {
  [attr in keyof K]?: K[attr] extends object ? Subset<K[attr]> : K[attr];
};

export interface QuestData {
  name: string;
  unlockLevel: number;
  expGained: number[];
  ai: string;
  spells: AcolyteFightSpell[][];
  options: Subset<AcolyteFightMod>;
  botHp: number;
}

export const quests = new Map<string, QuestData>(
  Object.entries<QuestData>({
    //TODO you might be able to revisit quests at higher levels, so provide level to spells somehow
    goblinHideout: {
      name: "Goblin Hideout",
      unlockLevel: 1,
      expGained: [10, 15],
      ai: "goblin",
      spells: [
        [big, small],
        [safe, dagger, bow],
      ],
      botHp: 75,
      options: {
        Matchmaking: { MinBots: 2, MaxBots: 3 },
        Hero: { Radius: 0.01 },
        World: { BotName: "Goblin" },
        Visuals: { BotColor: "#3d8038" },
      },
    },
  })
);
