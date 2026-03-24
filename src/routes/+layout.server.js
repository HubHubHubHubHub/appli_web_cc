import { readFileSync } from "fs";
import { resolve } from "path";

export const prerender = true;

export function load() {
  let wordData, phraseData;

  try {
    wordData = JSON.parse(readFileSync(resolve("static/data.json"), "utf-8"));
  } catch (err) {
    throw new Error(`Impossible de charger static/data.json : ${err.message}`);
  }

  try {
    phraseData = JSON.parse(readFileSync(resolve("static/phrases.json"), "utf-8"));
  } catch (err) {
    throw new Error(`Impossible de charger static/phrases.json : ${err.message}`);
  }

  return { wordData, phraseData };
}
