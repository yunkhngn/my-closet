import { describe, it, expect, beforeEach } from 'vitest';
import { useBuilderStore } from '@/store/builder';

describe('builder store', () => {
  beforeEach(() => useBuilderStore.setState({ selection: {} }));

  it('sets a single-item slot', () => {
    useBuilderStore.getState().setSlot('ao', 't1');
    expect(useBuilderStore.getState().selection.ao).toEqual(['t1']);
  });

  it('replaces a single-item slot', () => {
    const { setSlot } = useBuilderStore.getState();
    setSlot('ao', 't1');
    setSlot('ao', 't2');
    expect(useBuilderStore.getState().selection.ao).toEqual(['t2']);
  });

  it('appends multiple accessories', () => {
    const { addToSlot } = useBuilderStore.getState();
    addToSlot('phu_kien', 'a1');
    addToSlot('phu_kien', 'a2');
    expect(useBuilderStore.getState().selection.phu_kien).toEqual(['a1', 'a2']);
  });

  it('clearSlot empties a slot', () => {
    useBuilderStore.getState().setSlot('ao', 't1');
    useBuilderStore.getState().clearSlot('ao');
    expect(useBuilderStore.getState().selection.ao).toBeUndefined();
  });

  it('toRefs flattens the selection into OutfitItemRef[]', () => {
    const s = useBuilderStore.getState();
    s.setSlot('ao', 't1');
    s.setSlot('quan', 'b1');
    s.addToSlot('phu_kien', 'a1');
    s.addToSlot('phu_kien', 'a2');
    const refs = useBuilderStore.getState().toRefs();
    expect(refs).toContainEqual({ slot: 'ao', itemId: 't1' });
    expect(refs.filter((r) => r.slot === 'phu_kien')).toHaveLength(2);
  });

  it('loadRefs replaces the whole selection', () => {
    useBuilderStore.getState().loadRefs([
      { slot: 'ao', itemId: 't9' },
      { slot: 'phu_kien', itemId: 'a1' },
      { slot: 'phu_kien', itemId: 'a2' },
    ]);
    const sel = useBuilderStore.getState().selection;
    expect(sel.ao).toEqual(['t9']);
    expect(sel.phu_kien).toEqual(['a1', 'a2']);
  });
});
