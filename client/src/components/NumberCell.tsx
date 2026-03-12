import { motion } from 'framer-motion';
import type { NumberState } from '../types';

interface NumberCellProps {
  num: NumberState;
  isLastCalled: boolean;
}

export function NumberCell({ num, isLastCalled }: NumberCellProps) {
  return (
    <motion.div
      layout
      className={`
        relative flex items-center justify-center
        aspect-square rounded-lg cursor-default select-none
        font-display text-xl sm:text-2xl md:text-3xl tracking-wide
        transition-colors duration-200
        ${num.called
          ? isLastCalled
            ? 'bg-gradient-to-br from-brb-red to-red-700 text-white number-glow-intense'
            : 'bg-gradient-to-br from-brb-red/90 to-brb-red-dark text-white/95 number-glow'
          : 'bg-brb-card text-brb-text-muted border border-brb-border hover:border-brb-border-bright hover:text-brb-text-dim cell-inset'
        }
      `}
      animate={
        num.called
          ? {
              scale: [1, 1.1, 1],
              transition: { duration: 0.35, ease: 'easeOut' },
            }
          : {}
      }
    >
      {/* Inner highlight for called numbers */}
      {num.called && (
        <motion.div
          className="absolute inset-0 rounded-lg border border-white/10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="absolute inset-x-0 top-0 h-1/3 rounded-t-lg bg-gradient-to-b from-white/10 to-transparent" />
        </motion.div>
      )}

      {/* The number */}
      <span className="relative z-10">{num.number}</span>

      {/* Pulse ring on last-called */}
      {isLastCalled && (
        <motion.div
          className="absolute inset-0 rounded-lg border-2 border-brb-red-glow"
          animate={{
            scale: [1, 1.18, 1],
            opacity: [0.8, 0, 0.8],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}
    </motion.div>
  );
}
