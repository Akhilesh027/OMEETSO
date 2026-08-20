import { BottomSheet } from "./BottomSheet";
import { SORT_OPTIONS } from "@/lib/mock";
import { Check } from "lucide-react";

export function SortSheet({
  open, onClose, value, onChange,
}: { open: boolean; onClose: () => void; value: string; onChange: (id: string) => void }) {
  return (
    <BottomSheet open={open} onClose={onClose} title="Sort by">
      <div className="space-y-1 pb-2">
        {SORT_OPTIONS.map((opt) => {
          const active = value === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => { onChange(opt.id); onClose(); }}
              className="flex w-full items-center justify-between rounded-2xl px-3 py-3 text-left text-sm hover:bg-secondary"
            >
              <span className={active ? "font-bold text-primary" : ""}>{opt.label}</span>
              {active && <Check className="h-4 w-4 text-primary" />}
            </button>
          );
        })}
      </div>
    </BottomSheet>
  );
}
