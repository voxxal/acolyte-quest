export const defaultKeys: Key[] = [
  {
    btn: "a",
    barSize: 0.75,
    wheelSize: 0.5,
  },
  null,
  {
    btn: "q",
    barSize: 1,
    wheelSize: 1,
  },
  {
    btn: "w",
    barSize: 1,
    wheelSize: 0.75,
  },
  {
    btn: "e",
    barSize: 1,
    wheelSize: 0.75,
  },
  {
    btn: "r",
    barSize: 1,
    wheelSize: 0.75,
  },
  null,
  {
    btn: "f",
    barSize: 0.75,
    wheelSize: 0.5,
  },
];

export const defaultOptions: KeyBindingOptions = {
  a: [["thrust"], ["teleport", "swap"], ["voidRush", "vanish"]],
  q: [
    ["fireball", "flamestrike"],
    ["triplet", "difire"],
    ["retractor", "backlash"],
    ["whip", "phaseOrb"],
  ],
  w: [
    ["drain", "boost"],
    ["homing", "boomerang"],
    ["gravity", "whirlwind"],
    ["link", "grapple"],
    ["lightning"],
  ],
  e: [
    ["meteor", "meteorite"],
    ["armor", "horcrux"],
    ["shield", "icewall"],
    ["saber", "dualSaber"],
    ["phaseOut", "blaze"],
  ],
  r: [
    ["repeater", "bouncer"],
    ["empower"],
    ["supernova", "rocket"],
    ["kamehameha", "blast"],
  ],
  f: [["mines"], ["bump", "scourge"], ["firespray", "iceBomb"], ["halo"]],
};

export const defaultSpecial: KeyBindings = {
  move: "move",
  retarget: "retarget",
  s: "stop",
};

export const defaultChoices = {
  Keys: defaultKeys,
  Options: defaultOptions,
  Special: defaultSpecial,
};

const mergeTwoArrays = <T>(base: Array<T>, putIn: Array<T>) => {
  if (!putIn) return base;
  for (let property in base) {
    if (Array.isArray(base[property])) {
      // BRO READ THIS LINE AHHHHHHH ^^^^^^
      (base[property] as any) = (base[property] as unknown as T[]).concat(
        putIn[property] || []
      );
      continue;
    }
  }
  console.log(JSON.stringify(base));
  return base;
};

// Object.assign exists but might not work for deep copies
const merge = (obj: any, putIn: any) => {
  for (const property in putIn) {
    // if (!putIn.hasOwnProperty(property))
    //     continue;       // skip this property

    if (
      putIn[property] &&
      typeof putIn[property] === "object" &&
      !Array.isArray(putIn[property])
    ) {
      obj[property] = merge(obj[property], putIn[property]);
      continue;
    } else if (Array.isArray(putIn[property])) {
      obj[property] = mergeTwoArrays(obj[property], putIn[property]);
      continue;
    }

    // Only do this if the types are the same;
    if (putIn[property]) obj[property] = putIn[property];
  }
  return obj;
};

interface KeyBindingMod {
  [key: string]: (string[] | undefined)[];
}

export const addSpells = (spells: KeyBindingMod): KeyBindingOptions => {
  return merge(defaultOptions, spells);
};
// This module needs *a lot* of refining, *ONLY UPDATE PARTS THAT ACTUALLY NEED UPDATING!!!*
// Should be a simple fix though.