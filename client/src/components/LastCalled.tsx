import { motion, AnimatePresence } from 'framer-motion';

interface LastCalledProps {
  number: number | null;
}

export function LastCalled({ number }: LastCalledProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      <span className="text-[11px] font-mono uppercase tracking-[0.3em] text-brb-red">
        Last Called
      </span>

      <div className="relative w-28 h-28 sm:w-36 sm:h-36 flex items-center justify-center">
        {/* Outer ambient glow */}
        {number !== null && (
          <div className="absolute -inset-3 rounded-full bg-brb-red/10 blur-xl animate-ember" />
        )}

        {/* Background ring */}
        <div className="absolute inset-0 rounded-full border-2 border-brb-border bg-gradient-to-b from-brb-surface to-brb-card" />

        {/* Active glow ring */}
        {number !== null && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-brb-red ring-pulse"
            animate={{
              boxShadow: [
                '0 0 20px rgba(220,38,38,0.3), 0 0 60px rgba(220,38,38,0.1)',
                '0 0 40px rgba(220,38,38,0.5), 0 0 100px rgba(220,38,38,0.2)',
                '0 0 20px rgba(220,38,38,0.3), 0 0 60px rgba(220,38,38,0.1)',
              ],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}

        {/* Inner red accent ring */}
        {number !== null && (
          <div className="absolute inset-1 rounded-full border border-brb-red/20" />
        )}

        {/* Number */}
        <AnimatePresence mode="wait">
          <motion.span
            key={number ?? 'empty'}
            className={`
              relative z-10 font-display
              ${number !== null ? 'text-6xl sm:text-7xl text-white' : 'text-4xl text-brb-text-muted'}
            `}
            initial={{ scale: 0.5, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: -10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            {number ?? '—'}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
}
