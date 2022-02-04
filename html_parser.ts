import { DOMParser, Element, HTMLDocument } from "./deps.ts";

import { Image } from "./types.d.ts";

const BASE = "https://apod.nasa.gov/apod/";

const parser = new DOMParser();

export const parse = async (html: string): Promise<Image> => {
  const document = parser.parseFromString(html, "text/html");
  if (document === null) throw new Error("HTML could not be parsed");

  const props: any = {};

  const img = document.getElementsByTagName("img")[0];
  const iframe = document.getElementsByTagName("iframe")[0];
  const embed = document.getElementsByTagName("embed")[0];
  const param = document.getElementsByTagName("param")[0];

  if (img) {
    props["media_type"] = "image";
    props["url"] = BASE + img.getAttribute("src");
    props["hdurl"] = BASE + img.parentElement?.getAttribute("href");
  } else if (iframe) {
    props["media_type"] = "video";
    props["url"] = iframe.getAttribute("src")!;
  } else if (embed) {
    props["media_type"] = "video";
    props["url"] = embed.getAttribute("src")!;
  } else {
    props["media_type"] = "other";
    if (param) {
      props["url"] = BASE + param.getAttribute("value");
    }
  }

  props["thumbnail_url"] = await getThumbs(props["url"]);

  props["date"] = getDate(html);
  props["title"] = getTitle(document);
  props["copyright"] = getCopyright(document);
  props["explanation"] = getExplanation(document);

  return props;
};

const getThumbs = async (url: string): Promise<string | undefined> => {
  if (url.includes("youtube") || url.includes("youtu.be")) {
    const videoId = url.match(
      /(?:(?<=(v|V)\/)|(?<=be\/)|(?<=(\?|\&)v=)|(?<=embed\/))([\w-]+)/
    );
    if (videoId) return "https://img.youtube.com/vi/" + videoId[0] + "/0.jpg";
  }

  if (url.includes("vimeo")) {
    const videoId = url.match(/(?:\/video\/)(\d+)/);
    console.log(videoId);
    if (videoId) {
      const request = await fetch(
        "https://vimeo.com/api/v2/video/" + videoId[1] + ".json"
      );
      const data = await request.json();
      return data[0]["thumbnail_large"];
    }
  }
};

const months: Record<string, string> = {
  january: "01",
  february: "02",
  march: "03",
  april: "04",
  may: "05",
  june: "06",
  july: "07",
  august: "08",
  september: "09",
  october: "10",
  november: "11",
  december: "12",
};

const getDate = (html: string): string => {
  for (let line of html.split("\n")) {
    const month = months[line.match(/[a-z]+/i)?.[0].toLowerCase() ?? ""];
    const year = line.match(/\d{4}/)?.[0];
    const day = line.match(/(?<!\d)\d{1,2}(?!\d)/)?.[0].padStart(2, "0");
    if (!month || !year || !day) continue;
    return [year, month, day].join("-");
  }
  return "";
};

const getTitle = (document: HTMLDocument): string => {
  const centers = [...document.getElementsByTagName("center")];
  if (centers.length == 2) {
    const bold = (centers[0] as Element).getElementsByTagName("b")[0]!;
    return bold.textContent.trim().split(/\s+/).join(" ");
  }
  return centers[1].textContent.trim().split(/\s+/).join(" ");
};

const getCopyright = (document: HTMLDocument): string | undefined => {
  const copyright = [...document.getElementsByTagName("b")].find((node) =>
    node.textContent.match(/Copyright/i)
  );
  if (copyright) {
    return (copyright as Element).nextElementSibling?.textContent
      .trim()
      .split(/\s+/)
      .join(" ");
  }
};

const getExplanation = (document: HTMLDocument): string => {
  const centers = [...document.getElementsByTagName("center")];
  const text = centers[1].nextSibling?.nextSibling?.textContent as string;
  return text.replace("Explanation: ", "").trim().split(/\s+/).join(" ");
};
