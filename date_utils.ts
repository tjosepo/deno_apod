let MIN_DATE = "1995-06-16";
MIN_DATE = "2000-06-16";

const DAY_LENGTH = 24 * 60 * 60 * 1000;

export const toISODate = (date: Date | number | string): string => {
  return new Date(date).toISOString().split("T")[0];
};

export const getRandomDates = (count: number): string[] => {
  const min = Date.parse(MIN_DATE);
  const today = Date.now();
  const daysSinceMin = Math.floor((today - min) / DAY_LENGTH);
  const dates: string[] = [];

  for (let i = 0; i < count; i++) {
    const randomDaySinceMin = Math.floor(Math.random() * daysSinceMin);
    const date = new Date(min + randomDaySinceMin * DAY_LENGTH);
    dates.push(toISODate(date));
  }

  return dates;
};
