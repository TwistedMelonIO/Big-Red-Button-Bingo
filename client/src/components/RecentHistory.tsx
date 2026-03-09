import { motion, AnimatePresence } from 'framer-motion';

interface RecentHistoryProps {
  history: number[];
  max?: number;
}

export function RecentHistory({ history, max = 10 }: RecentHistoryProps) {
  const recent = history.slice(0, max);

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-mono uppercase tracking-[0.25em] text-brb-text-muted">
        Recent
      </span>

      <div className="flex flex-col gap-1.5 min-h-[120px]">
        <AnimatePresence initial={false}>
          {recent.length === 0 ? (
            <span className="text-sm text-brb-text-muted italic">No numbers called</span>
          ) : (
            recent.map((num, idx) => (
              <motion.div
                key={`${num}-${idx}`}
                initial={{ opacity: 0, x: -20, height: 0 }}
                animate={{ opacity: 1, x: 0, height: 'auto' }}
                exit={{ opacity: 0, x: 20, height: 0 }}
                transition={{ duration: 0.25 }}
                className={`
                  flex items-center gap-3 px-3 py-1.5 rounded-md font-mono text-sm
                  ${idx === 0
                    ? 'bg-brb-red/20 text-brb-red border border-brb-red/30 font-bold'
                    : 'bg-brb-card/50 text-brb-text-dim border border-transparent'
                  }
                `}
              >
                <span className="w-5 text-right text-brb-text-muted text-xs">
                  {idx + 1}.
                </span>
                <span className="font-display font-bold text-base">
                  {num}
                </span>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
