const additionModule = new Uint8Array([
  0, 97, 115, 109, 1, 0, 0, 0, 1, 7, 1, 96, 2, 124, 124, 1, 124,
  3, 2, 1, 0, 7, 7, 1, 3, 97, 100, 100, 0, 0, 10, 9, 1, 7, 0, 32, 0, 32, 1, 160, 11
]);

let add: ((left: number, right: number) => number) | undefined;

export async function sum(values: number[]) {
  if (!add && typeof WebAssembly !== "undefined") {
    const instanceResult = await WebAssembly.instantiate(additionModule);
    add = instanceResult.instance.exports.add as (left: number, right: number) => number;
  }
  return values.reduce((total, value) => add ? add(total, value) : total + value, 0);
}
