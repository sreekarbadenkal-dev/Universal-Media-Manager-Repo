export function createReverseLookupMap<
  T extends Record<string, readonly string[]>,
  K extends string = Extract<keyof T, string>,
>(
  groups: T,
  options?: {
    mapKey?: (key: Extract<keyof T, string>) => K;//callback to edit the keys
    normalize?: (value: string) => string;//callback to edit the values
  },
): Map<string, K> {
  const mapKey = options?.mapKey ?? ((k) => k as unknown as K);
  const normalize = options?.normalize ?? ((v) => v.trim().toLowerCase());
  const reversedLookup = new Map<string, K>();

  //loop array of tupple of [k:string,v:string[]] and apply callback fn before creating a new hashmap
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