export interface Image {
  media_type: "image" | "video" | "other";
  url: string;
  thumbnail_url: string | undefined;
  date: string;
  title: string;
  hdurl: string | undefined;
  copyright: string | undefined;
  explanation: string;
}
