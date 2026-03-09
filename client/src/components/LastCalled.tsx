import { motion, AnimatePresence } from 'framer-motion';

interface LastCalledProps {
  number: number | null;
}

export function LastCalled({ number }: LastCalledProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-xs font-mono uppercase tracking-[0.25em] text-brb-text-muted">
        Last Called
      </span>

      <div className="relative w-28 h-28 sm:w-36 sm:h-36 flex items-center justify-center">
        {/* Background ring */}
        <div className="absolute inset-0 rounded-full border-2 border-brb-border bg-brb-surface" />
        
        {/* Glow ring when active */}
        {number !== null && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-brb-red"
            animate={{
              boxShadow: [
                '0 0 15px rgba(230,57,70,0.3)',
                '0 0 35px rgba(230,57,70,0.5)',
                '0 0 15px rgba(230,57,70,0.3)',
              ],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}

        {/* Number */}
        <AnimatePresence mode="wait">
          <motion.span
            key={number ?? 'empty'}
            className={`
              relative z-10 font-display font-extrabold
              ${number !== null ? 'text-5xl sm:text-6xl text-white' : 'text-3xl text-brb-text-muted'}
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
