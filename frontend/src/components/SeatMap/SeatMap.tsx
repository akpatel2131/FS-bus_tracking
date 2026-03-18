import { useCallback, useEffect, useRef } from 'react';
import type { SeatMapItem } from '../../types';
import './SeatMap.css';

interface SeatMapProps {
  seatMap: SeatMapItem[];
  selected: number[];
  onToggle: (n: number) => void;
  maxSelect: number;
  disabled?: boolean;
}

export function SeatMap({ seatMap, selected, onToggle, maxSelect, disabled = false }: SeatMapProps) {
  const gridRef = useRef<HTMLDivElement>(null);

  /** Direct DOM update — avoids re-rendering the whole grid on each click */
  const updateSeatDOM = useCallback((num: number, isSelected: boolean) => {
    const el = gridRef.current?.querySelector<HTMLButtonElement>(`[data-seat="${num}"]`);
    if (!el) return;
    if (isSelected) {
      el.classList.add('seat-btn--selected');
    } else {
      el.classList.remove('seat-btn--selected');
    }
  }, []);

  // Sync DOM whenever `selected` changes (e.g. after reset / cancel)
  useEffect(() => {
    seatMap.forEach(({ number, isBooked }) => {
      if (isBooked) return;
      updateSeatDOM(number, selected.includes(number));
    });
  }, [selected, seatMap, updateSeatDOM]);

  const handleClick = (seat: SeatMapItem) => {
    if (disabled || seat.isBooked) return;
    const alreadySelected = selected.includes(seat.number);

    if (!alreadySelected && selected.length >= maxSelect) {
      // Flash counter to warn user
      const el = document.getElementById('seat-counter');
      if (el) {
        el.classList.add('seatmap__counter--warn');
        setTimeout(() => el.classList.remove('seatmap__counter--warn'), 600);
      }
      return;
    }

    // Instant DOM feedback BEFORE React state update
    updateSeatDOM(seat.number, !alreadySelected);
    onToggle(seat.number);
  };

  // Group into rows of 4 (2 + aisle + 2)
  const rows: SeatMapItem[][] = [];
  for (let i = 0; i < seatMap.length; i += 4) rows.push(seatMap.slice(i, i + 4));

  return (
    <div className="seatmap">
      {/* Legend */}
      <div className="seatmap__legend">
        {[
          { color: 'var(--clr-elevated)', border: '1px solid var(--clr-border)', label: 'Available' },
          { color: 'var(--clr-amber)',    border: 'none',                         label: 'Selected'  },
          { color: 'var(--clr-surface)',  border: '1px solid var(--clr-surface)', label: 'Booked'    },
        ].map(({ color, border, label }) => (
          <div className="seatmap__legend-item" key={label}>
            <div className="seatmap__legend-dot" style={{ background: color, border }} />
            <span>{label}</span>
          </div>
        ))}
      </div>

      {/* Bus front */}
      <div className="seatmap__bus-front">
        <div className="seatmap__driver-pill">🚌 FRONT</div>
      </div>

      {/* Seat grid */}
      <div className="seatmap__grid" ref={gridRef}>
        {/* Column headers */}
        <div className="seatmap__col-labels">
          <span className="seatmap__col-label">A</span>
          <span className="seatmap__col-label">B</span>
          <span className="seatmap__col-label seatmap__col-label--aisle" />
          <span className="seatmap__col-label">C</span>
          <span className="seatmap__col-label">D</span>
        </div>

        {rows.map((row, ri) => (
          <div className="seatmap__row" key={ri}>
            <span className="seatmap__row-num">{ri + 1}</span>

            {/* Left pair */}
            <div className="seatmap__pair">
              {row.slice(0, 2).map(seat => (
                <SeatBtn key={seat.number} seat={seat} isSelected={selected.includes(seat.number)} disabled={disabled} onClick={handleClick} />
              ))}
            </div>

            <div className="seatmap__aisle" />

            {/* Right pair */}
            <div className="seatmap__pair">
              {row.slice(2, 4).map(seat => (
                <SeatBtn key={seat.number} seat={seat} isSelected={selected.includes(seat.number)} disabled={disabled} onClick={handleClick} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Selection counter */}
      <span id="seat-counter" className="seatmap__counter">
        {selected.length > 0
          ? `${selected.length} of ${maxSelect} seat${maxSelect !== 1 ? 's' : ''} selected`
          : `Tap to select up to ${maxSelect} seat${maxSelect !== 1 ? 's' : ''}`}
      </span>
    </div>
  );
}

/* Individual seat button — its selected state is managed by DOM class, not re-render */
function SeatBtn({
  seat, isSelected, disabled, onClick,
}: {
  seat: SeatMapItem;
  isSelected: boolean;
  disabled: boolean;
  onClick: (s: SeatMapItem) => void;
}) {
  return (
    <button
      data-seat={seat.number}
      className={[
        'seat-btn',
        seat.isBooked  ? 'seat-btn--booked'   : '',
        isSelected     ? 'seat-btn--selected'  : '',
      ].join(' ')}
      disabled={seat.isBooked || disabled}
      title={seat.isBooked ? `Seat ${seat.number} – Booked` : `Seat ${seat.number}`}
      onClick={() => onClick(seat)}
    >
      {seat.isBooked ? '×' : seat.number}
    </button>
  );
}