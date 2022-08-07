export type Feeding = {
  date: string;
  time: string;
  quantity: number;
  notes: string;
};

export const testFeed: Feeding = {
  date: "2020-01-01",
  time: "00:00",
  quantity: 1,
  notes: "First feed",
};
export const testFeed2: Feeding = {
  date: "2022-01-01",
  time: "13:00",
  quantity: 1,
  notes: "second feed",
};

export const allfeeds = [testFeed, testFeed2];
