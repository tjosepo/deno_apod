import { parse } from "./html_parser.ts";
import { Image } from "./types.d.ts";

export interface ApodOptions {
  thumbs?: boolean;
}

export const apod = async (
  date: string,
  options: ApodOptions = {}
): Promise<Image> => {
  const { thumbs = false } = options;
  const [year, month, day] = date.split("-");
  const url =
    "https://apod.nasa.gov/apod/ap" + year.substring(2) + month + day + ".html";

  const response = await fetch(url);
  const html = await response.text();
  try {
    const image = await parse(html, { thumbs });
    return image;
  } catch (e) {
    console.error(new Error("Could not parse " + url + "\n" + e.stack));
    throw new Error("Could not parse " + url + "\n" + e.stack);
  }
};
