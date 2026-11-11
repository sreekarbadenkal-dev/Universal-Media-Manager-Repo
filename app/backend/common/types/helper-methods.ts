export function createReverseLookupMap<
  T extends Record<string, readonly string[]>,
  K extends string = Extract<keyof T, string>,
>(
  groups: T,
  options?: {
    mapKey?: (key: Extract<keyof T, string>) => K;
    normalize?: (value: string) => string;
  },
): Map<string, K> {
  const mapKey = options?.mapKey ?? ((k) => k as unknown as K);
  const normalize = options?.normalize ?? ((v) => v.trim().toLowerCase());
  const reversedLookup = new Map<string, K>();

  for (const [groupKey, values] of Object.entries(groups) as [
    Extract<keyof T, string>,
    readonly string[],
  ][]) {
    const targetKey = mapKey(groupKey);
    for (const value of values) {
      reversedLookup.set(normalize(value), targetKey);
    }
  }

  return reversedLookup;
}