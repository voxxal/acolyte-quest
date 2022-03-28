export const tip = (t: string, mobile = false) => {
  return mobile ? { tip: t, isMobile: mobile } : t;
};
