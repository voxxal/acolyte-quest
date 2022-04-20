import { big, bow, dagger, small } from "./spells/goblinHideout";
import { safe } from "./spells/generic/safe";

type Subset<K> = {
  [attr in keyof K]?: K[attr] extends object ? Subset<K[attr]> : K[attr];
};

export interface QuestData {
  name: string;
  unlockLevel: number;
  ai: string;
  spells: AcolyteFightSpell[][];
  options: Subset<AcolyteFightMod>;
  botHp: number;
}

export const quests = new Map<string, QuestData>(
  Object.entries<QuestData>({
    //TODO placeholder
    goblinHideout: {
      name: "Goblin Hideout",
      unlockLevel: 1,
      ai: "goblin",
      spells: [
        [big, small],
        [safe, dagger, bow],
      ],
      botHp: 75,
      options: {
        Matchmaking: { MinBots: 3, MaxBots: 3 },
        Hero: { Radius: 0.01 },
        World: { BotName: "Goblin" },
        Visuals: { BotColor: "#3d8038" },
      },
    },
  })
);
