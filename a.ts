type Entry = {
  value: string | [string];
  expireAt: number | null;
  type: string;
};

type data = {
  [key: string]: Entry;
};
