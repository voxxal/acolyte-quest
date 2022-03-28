export const TicksPerSecond = 60;
export const Pixel = 0.001;

export namespace Categories {
  export const All = 0xFFFF;
  export const Hero = 0x1;
  export const Projectile = 0x2;
  export const Massive = 0x4;
  export const Obstacle = 0x8;
  export const Shield = 0x10;
  export const Blocker = 0x20;
  export const None = 0;
}

export namespace Alliances {
  export const All = 0xFFFF;
  export const None = 0;

  export const Self = 0x01;
  export const Ally = 0x02;
  export const Enemy = 0x04;
  export const Neutral = 0x08;

  export const Friendly = Self | Ally;
  export const NotFriendly = Enemy | Neutral;
}

export namespace GraphicsLevel {
  export const Maximum = 5;
  export const Ultra = 4; // Blooms
  export const High = 3; // Particles
  export const Medium = 2; // Shadows
  export const Low = 1;
  export const Minimum = 0.5;
}
