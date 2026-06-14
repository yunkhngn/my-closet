'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/auth';
import { useItemsStore } from '@/store/items';
import { useBuilderStore } from '@/store/builder';
import { suggest, type ScoredOutfit } from '@/lib/engine';
import { applyFilter, type Filter } from '@/lib/filter';
import { addOutfit } from '@/lib/db';
import { CLOTHING_TYPES, SLOT_CONFIG, type OutfitItemRef } from '@/types';
import { SlotPicker } from '@/components/slot-picker';
import { OutfitCard } from '@/components/outfit-card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { fetchAiSuggestions } from '@/lib/ai/client';

const REQUIRED = CLOTHING_TYPES.filter((t) => SLOT_CONFIG[t].required);

export function OutfitBuilder({ filter }: { filter: Filter }) {
  const uid = useAuthStore((s) => s.user!.uid);
  const items = useItemsStore((s) => s.items);
  const { toRefs, loadRefs, selection } = useBuilderStore();
  const [suggestions, setSuggestions] = useState<Array<ScoredOutfit & { reason?: string }>>([]);
  const [saved, setSaved] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [context, setContext] = useState('');
  const [aiBusy, setAiBusy] = useState(false);
  const [aiNote, setAiNote] = useState<string | null>(null);

  const subset = applyFilter(items, filter);

  function quickSuggest() {
    setSaved(null);
    setAiNote(null);
    setSuggestions(suggest(subset, { topN: 6 }));
  }

  async function askAi() {
    setSaved(null);
    setAiNote(null);
    setAiBusy(true);
    try {
      const { outfits, error } = await fetchAiSuggestions(subset, context);
      if (error || outfits.length === 0) {
        setSuggestions(suggest(subset, { topN: 6 }));
        setAiNote(
          error
            ? `${error} — hiển thị gợi ý nhanh thay thế.`
            : 'AI không trả về kết quả — hiển thị gợi ý nhanh thay thế.',
        );
      } else {
        setSuggestions(outfits.map((o) => ({ items: o.items, score: 1, reason: o.reason })));
      }
    } catch {
      setSuggestions(suggest(subset, { topN: 6 }));
      setAiNote('AI gặp lỗi — hiển thị gợi ý nhanh thay thế.');
    } finally {
      setAiBusy(false);
    }
  }

  async function save(refs: OutfitItemRef[], source: 'manual' | 'algo' | 'ai') {
    setIsSaving(true);
    setSaved(null);
    try {
      await addOutfit(uid, {
        items: refs,
        source,
        occasion: filter.occasion,
      });
      setSaved('Đã lưu thành công!');
      setTimeout(() => setSaved(null), 3000);
    } catch (error) {
      console.error('Failed to save outfit:', error);
      setSaved('Lưu thất bại.');
    } finally {
      setIsSaving(false);
    }
  }

  const manualRefs = toRefs();
  const manualComplete = REQUIRED.every((t) => (selection[t]?.length ?? 0) > 0);

  return (
    <div className="space-y-8">
      <div className="space-y-5 rounded-xl border p-4 bg-card shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
          Ngăn Tủ Đồ
        </h2>
        {CLOTHING_TYPES.map((slot) => (
          <SlotPicker key={slot} slot={slot} />
        ))}
      </div>

      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Gợi ý phong cách & Dịp (AI)
        </label>
        <Textarea
          placeholder="Tùy chọn: mô tả phong cách, cảm giác hoặc dịp cụ thể (vd: 'lịch sự nhẹ cho buổi cà phê')"
          value={context}
          onChange={(e) => setContext(e.target.value)}
          rows={2}
        />
        {aiNote && <p className="text-xs text-amber-600 font-medium animate-in fade-in duration-200">{aiNote}</p>}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={quickSuggest} variant="outline" className="shadow-sm">
          Gợi ý nhanh
        </Button>
        <Button variant="default" onClick={askAi} disabled={aiBusy} className="shadow-sm">
          {aiBusy ? 'Đang hỏi AI…' : 'Hỏi AI'}
        </Button>
        <Button
          variant="outline"
          disabled={!manualComplete || isSaving}
          onClick={() => save(manualRefs, 'manual')}
          className="shadow-sm"
        >
          {isSaving ? 'Đang lưu...' : 'Lưu outfit hiện tại'}
        </Button>
        {saved && <span className="text-sm font-medium text-emerald-600 animate-in fade-in duration-200">{saved}</span>}
      </div>

      {suggestions.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Gợi ý
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {suggestions.map((s, i) => (
              <OutfitCard
                key={i}
                refs={s.items}
                reason={s.reason ?? `Điểm phù hợp ${(s.score * 100).toFixed(0)}%`}
                footer={
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => loadRefs(s.items)}>
                      Chỉnh sửa
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-8 text-xs"
                      onClick={() => save(s.items, s.reason ? 'ai' : 'algo')}
                    >
                      Lưu
                    </Button>
                  </div>
                }
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
