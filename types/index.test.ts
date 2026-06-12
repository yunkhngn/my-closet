import { describe, it, expect } from 'vitest';
import { CLOTHING_TYPES, SLOT_CONFIG, isClothingType } from '@/types';

describe('clothing types', () => {
  it('lists all five slots in display order', () => {
    expect(CLOTHING_TYPES).toEqual(['ao_khoac', 'ao', 'quan', 'giay', 'phu_kien']);
  });

  it('marks required vs optional slots correctly', () => {
    expect(SLOT_CONFIG.ao.required).toBe(true);
    expect(SLOT_CONFIG.quan.required).toBe(true);
    expect(SLOT_CONFIG.giay.required).toBe(true);
    expect(SLOT_CONFIG.ao_khoac.required).toBe(false);
    expect(SLOT_CONFIG.phu_kien.required).toBe(false);
  });

  it('marks accessory as multi-allowed', () => {
    expect(SLOT_CONFIG.phu_kien.multiple).toBe(true);
    expect(SLOT_CONFIG.ao.multiple).toBe(false);
  });

  it('validates clothing type strings', () => {
    expect(isClothingType('ao')).toBe(true);
    expect(isClothingType('hat')).toBe(false);
  });
});
