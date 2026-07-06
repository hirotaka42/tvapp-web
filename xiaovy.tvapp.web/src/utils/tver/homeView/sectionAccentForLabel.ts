import { SectionAccent } from './types';

export const SECTION_ACCENTS: SectionAccent[] = ['s-pink', 's-yellow', 's-blue', 's-orange', 's-purple'];

export function sectionAccentForLabel(_label: string, index: number): SectionAccent {
  const normalized = Math.abs(index) % SECTION_ACCENTS.length;
  return SECTION_ACCENTS[normalized];
}
