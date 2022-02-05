import { apod, ApodOptions } from "./apod.ts";
import {
  getRandomDates,
  getRange,
  isValidApodDate,
  isValidRange,
  toISODate,
} from "./date_utils.ts";
import { serve } from "./deps.ts";
import { Image } from "./types.d.ts";

const headers = new Headers({ "access-control-allow-origin": "*" });

serve(async (req: Request) => {
  const url = new URL(req.url);
  const params = url.searchParams;
  const date = params.get("date");
  const count = params.get("count");
  const start = params.get("start_date");
  const end = params.get("end_date");
  const thumbs = params.get("thumbs");

  const options = {
    thumbs: thumbs === "true" || thumbs === "True",
  };

  try {
    if (date) return await getByDate(date, options);
    if (count) return await getRandom(count, options);
    if (start && end) return await getByRange(start, end, options);
    else {
      const today = toISODate(Date.now());
      return await getByDate(today, options);
    }
  } catch {
    return error(500, "Internal Server Error");
  }
});

const getByDate = async (
  date: string,
  options: ApodOptions
): Promise<Response> => {
  const isMatch = date.match(/^\d{4}-\d{2}-\d{2}$/);
  if (!isMatch) {
    return error(400, `Time data ${date} does not match format '%Y-%m-%d'`);
  }

  if (!isValidApodDate(date)) {
    return error(
      400,
      `Time data ${date} must be between "1995-06-16" and today`
    );
  }

  const image = await apod(date, options);
  return new Response(JSON.stringify(image), { headers });
};

const getRandom = async (
  count: string,
  options: ApodOptions
): Promise<Response> => {
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
    const request = apod(date, options)
      .catch(() => apod(getRandomDates(1)[0]))
      .catch(() => apod(getRandomDates(1)[0])); // In case any one of them fails
    requests.push(request);
  }
  const images = await Promise.all(requests);
  return new Response(JSON.stringify(images), { headers });
};

const getByRange = async (
  start: string,
  end: string,
  options: ApodOptions
): Promise<Response> => {
  const isStartMatch = start.match(/^\d{4}-\d{2}-\d{2}$/);
  if (!isStartMatch) {
    return error(400, `Time data ${start} does not match format '%Y-%m-%d'`);
  }

  const isEndMatch = start.match(/^\d{4}-\d{2}-\d{2}$/);
  if (!isEndMatch) {
    return error(400, `Time data ${end} does not match format '%Y-%m-%d'`);
  }

  if (!isValidApodDate(start)) {
    return error(
      400,
      `Time data ${start} must be between "1995-06-16" and today`
    );
  }

  if (!isValidApodDate(end)) {
    return error(
      400,
      `Time data ${end} must be between "1995-06-16" and today`
    );
  }

  if (!isValidRange(start, end)) {
    return error(400, `Start date ${start} must be before end date ${end}`);
  }

  const dates = getRange(start, end);
  const requests: Promise<Image>[] = [];
  for (const date of dates) {
    const request = apod(date, options)
      .catch(() => apod(getRandomDates(1)[0]))
      .catch(() => apod(getRandomDates(1)[0])); // In case any one of them fails
    requests.push(request);
  }
  const images = await Promise.all(requests);
  return new Response(JSON.stringify(images), { headers });
};

const error = (status: number, message: string) => {
  return new Response(
    JSON.stringify({ code: status, msg: message, service_version: "v1" }),
    {
      status,
      headers,
    }
  );
};
