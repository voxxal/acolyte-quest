import { writeFile } from "fs/promises";

export const modToFile = async (fileName: string, mod: AcolyteFightMod) => {
  await writeFile(fileName, JSON.stringify(mod));
};

//@ts-ignore
export const modToBuffer = (mod: AcolyteFightMod) =>
  Buffer.from(JSON.stringify(mod));
