import { Page } from "puppeteer";
import { modToFile } from "../modlyte";

export const uploadMod = async (page: Page, mod: AcolyteFightMod) => {
  await page.goto("https://us.acolytefight.io/modding");
  await page.waitForSelector("p");

  if (
    !(await page.$eval(
      "p",
      (ele) =>
        ele.innerHTML === "Mods allow you to change the rules of the game."
    ))
  ) await page.click("#root > div > div > div.page > div > div.btn");
  
  await page.waitForSelector("div.btn:nth-child(2)");
  const [fileChooser] = await Promise.all([
    page.waitForFileChooser(),
    page.click("div.btn:nth-child(2)"),
    // some button that triggers file selection
  ]);
  // Upload Mod
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
