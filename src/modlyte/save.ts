import fs from "fs/promises";

export const saveToFile = async (fileName: string, mod: AcolyteFightMod) => {
  await fs.writeFile(fileName, JSON.stringify(mod));
};
