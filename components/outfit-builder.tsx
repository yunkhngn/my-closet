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
      {/* Slot selection */}
      <div className="rounded-lg border border-border/60 bg-card px-5 py-5 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            Ngăn Tủ Đồ
          </h2>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-sm"
            disabled={!manualComplete || isSaving}
            onClick={() => save(manualRefs, 'manual')}
          >
            {isSaving ? 'Đang lưu…' : 'Lưu outfit này'}
          </Button>
        </div>
        <div className="space-y-4">
          {CLOTHING_TYPES.map((slot) => (
            <SlotPicker key={slot} slot={slot} />
          ))}
        </div>
      </div>

      {/* AI section */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <h2 className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            Gợi ý phong cách & Dịp
          </h2>
        </div>
        <Textarea
          placeholder="Tùy chọn: mô tả phong cách, cảm giác hoặc dịp cụ thể (vd: 'lịch sự nhẹ cho buổi cà phê')"
          value={context}
          onChange={(e) => setContext(e.target.value)}
          rows={2}
          className="text-[13px] resize-none"
        />
        {aiNote && (
          <p className="text-[12px] text-amber-600 font-medium animate-in fade-in duration-200">{aiNote}</p>
        )}
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={quickSuggest} variant="outline" size="sm" className="h-9 px-4 text-sm">
            Gợi ý nhanh
          </Button>
          <Button variant="default" size="sm" className="h-9 px-4 text-sm" onClick={askAi} disabled={aiBusy}>
            {aiBusy ? 'Đang hỏi AI…' : 'Hỏi AI'}
          </Button>
        </div>
      </div>

      {saved && (
        <p className="text-[12px] font-medium text-emerald-600 animate-in fade-in duration-200">{saved}</p>
      )}

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            Gợi ý
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {suggestions.map((s, i) => (
              <OutfitCard
                key={i}
                refs={s.items}
                reason={s.reason ?? `Điểm phù hợp ${(s.score * 100).toFixed(0)}%`}
                footer={
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-[11px]"
                      onClick={() => loadRefs(s.items)}
                    >
                      Chỉnh sửa
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-7 text-[11px]"
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
