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
        font-display font-bold text-lg sm:text-xl md:text-2xl
        transition-colors duration-200
        ${num.called
          ? isLastCalled
            ? 'bg-brb-red text-white number-glow-intense'
            : 'bg-brb-red/80 text-white/95 number-glow'
          : 'bg-brb-card text-brb-text-muted border border-brb-border hover:border-brb-border-bright hover:text-brb-text-dim'
        }
      `}
      animate={
        num.called
          ? {
              scale: [1, 1.08, 1],
              transition: { duration: 0.35, ease: 'easeOut' },
            }
          : {}
      }
    >
      {/* Inner glow ring for called numbers */}
      {num.called && (
        <motion.div
          className="absolute inset-0 rounded-lg border-2 border-white/10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
      )}

      {/* The number */}
      <span className="relative z-10">{num.number}</span>

      {/* Pulse ring on the last-called number */}
      {isLastCalled && (
        <motion.div
          className="absolute inset-0 rounded-lg border-2 border-brb-red-glow"
          animate={{
            scale: [1, 1.15, 1],
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
