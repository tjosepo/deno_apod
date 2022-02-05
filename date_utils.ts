const MIN_DATE = "1995-06-16";
const MILLISECONDS_IN_DAY = 24 * 60 * 60 * 1000;

export const toISODate = (date: Date | number | string): string => {
  return new Date(date).toISOString().split("T")[0];
};

export const getRandomDates = (count: number): string[] => {
  const min = Date.parse(MIN_DATE);
  const today = Date.now();
  const daysSinceMin = Math.floor((today - min) / MILLISECONDS_IN_DAY);
  const dates: string[] = [];

  for (let i = 0; i < count; i++) {
    const randomDaySinceMin = Math.floor(Math.random() * daysSinceMin);
    const date = new Date(min + randomDaySinceMin * MILLISECONDS_IN_DAY);
    dates.push(toISODate(date));
  }

  return dates;
};

export const isValidRange = (start: string, end: string): boolean => {
  return new Date(start) <= new Date(end);
};

export const isValidApodDate = (date: Date | number | string) => {
  if (date < new Date(MIN_DATE)) return false;
  if (date > Date.now()) return false;
  return true;
};

const nextDate = (date: Date | number | string): string => {
  return toISODate(Number(new Date(date)) + MILLISECONDS_IN_DAY);
};

export const getRange = (start: string, end: string): string[] => {
  if (!isValidRange(start, end)) {
    throw new Error("Start date must be before end date");
  }

  const dates: string[] = [];
  let currentDate = start;
  while (currentDate !== end) {
    dates.push(currentDate);
    currentDate = nextDate(currentDate);
  }
  dates.push(currentDate);
  return dates;
};
