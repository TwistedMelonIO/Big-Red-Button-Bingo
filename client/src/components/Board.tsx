import { NumberCell } from './NumberCell';
import type { NumberState } from '../types';

interface BoardProps {
  numbers: NumberState[];
  lastCalled: number | null;
}

export function Board({ numbers, lastCalled }: BoardProps) {
  // Arrange into rows of 10: 1-10, 11-20, ..., 81-90
  const rows: NumberState[][] = [];
  for (let i = 0; i < 90; i += 10) {
    rows.push(numbers.slice(i, i + 10));
  }

  return (
    <div className="space-y-1.5 sm:space-y-2">
      {/* Row labels */}
      {rows.map((row, rowIdx) => (
        <div key={rowIdx} className="flex items-center gap-1.5 sm:gap-2">
          {/* Row range label */}
          <div className="hidden sm:flex w-14 shrink-0 items-center justify-end pr-2">
            <span className="text-xs font-mono text-brb-text-muted tracking-tight">
              {rowIdx * 10 + 1}–{rowIdx * 10 + 10}
            </span>
          </div>

          {/* Number cells */}
          <div className="grid grid-cols-10 gap-1.5 sm:gap-2 flex-1">
            {row.map((num) => (
              <NumberCell
                key={num.number}
                num={num}
                isLastCalled={num.number === lastCalled}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
