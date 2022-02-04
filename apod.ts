import { parse } from "./html_parser.ts";
import { Image } from "./types.d.ts";

export const apod = async (date: string): Promise<Image> => {
  const [year, month, day] = date.split("-");
  const url =
    "https://apod.nasa.gov/apod/ap" + year.substring(2) + month + day + ".html";

  const response = await fetch(url);
  const html = await response.text();
  try {
    const image = await parse(html);
    return image;
  } catch (e) {
    throw new Error(
      "Could not parse " + url + "\n" + String(e) + "\n" + e.stack
    );
  }
};
