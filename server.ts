import { apod } from "./apod.ts";
import { getRandomDates } from "./date_utils.ts";
import { serve } from "./deps.ts";
import { Image } from "./types.d.ts";

serve(async (req: Request) => {
  const url = new URL(req.url);
  const params = url.searchParams;
  const date = params.get("date");
  const count = params.get("count");

  if (date) return getByDate(date);
  if (count) return getRandom(count);

  return new Response("Bad Request", { status: 400 });
});

const getByDate = async (date: string): Promise<Response> => {
  const isMatch = date.match(/^\d{4}-\d{2}-\d{2}$/);
  if (!isMatch)
    return error(400, `Time data ${date} does not match format '%Y-%m-%d'`);
  const image = await apod(date);
  return new Response(JSON.stringify(image));
};

const getRandom = async (count: string): Promise<Response> => {
  const number = parseInt(count, 10);
  if (isNaN(number)) {
    return error(400, `Count ${count} is not a number`);
  }
  if (number > 100 || number <= 0) {
    return error(400, `Count must be positive and cannot exceed 100`);
  }

  const dates = getRandomDates(number);
  const requests: Promise<Image>[] = [];
  for (const date of dates) {
    const request = apod(date);
    requests.push(request);
  }
  const images = await Promise.all(requests);
  return new Response(JSON.stringify(images));
};

const error = (status: number, message: string) => {
  return new Response(JSON.stringify({ code: status, msg: message }), {
    status,
  });
};
