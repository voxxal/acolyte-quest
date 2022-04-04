import { Page } from "puppeteer";
import { modToFile } from "../modlyte";

export const uploadMod = async (page: Page, mod: AcolyteFightMod) => {
  await page.goto("https://us.acolytefight.io/modding");
  // Upload Mod
  const [fileChooser] = await Promise.all([
    page.waitForFileChooser(),
    page.click("div.btn:nth-child(2)"),
  ]);
  await modToFile("./tmp/mod.json", mod);
  await fileChooser.accept(["./tmp/mod.json"]);
};

export const createParty = async (page: Page): Promise<string> => {
  await page.waitForSelector("span.btn");
  await page.click("span.btn");

  await page.waitForSelector("i.fas.fa-eye");

  // Set self to observer
  await page.click("i.fas.fa-eye");
  return await page.$eval("input.share-url", (ele) =>
    ele.getAttribute("value")
  );
};
