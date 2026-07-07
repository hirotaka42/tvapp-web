export function thumbGradientClass(id: string): `ag${number}` {
  const source = id || 'abema';
  let hash = 0;

  for (let index = 0; index < source.length; index += 1) {
    hash = (hash * 31 + source.charCodeAt(index)) >>> 0;
  }

  return `ag${(hash % 9) + 1}`;
}
