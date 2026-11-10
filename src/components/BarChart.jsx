// Small single-series bar charts (no chart library). One hue, checked for contrast on the
// light and dark chart surfaces; thin bars with a rounded top on a single baseline;
// hover/focus tooltip on every bar; a table view for screen readers and exact numbers.
import { useState } from 'react';
import Tooltip from '@mui/material/Tooltip';

const niceMax = (v) => {
  if (v <= 4) return 4;
  const p = 10 ** Math.floor(Math.log10(v));
  return [1, 2, 2.5, 5, 10].map((m) => m * p).find((m) => m >= v);
};

/** Vertical bars over time. data: [{ label, value, tip }] */
export function ColumnChart({ data, height = 150, title }) {
  const W = 320; const H = height; const L = 26; const B = 20; const T = 8;
  const max = niceMax(Math.max(...data.map((d) => d.value), 0));
  const band = (W - L) / data.length;
  const barW = Math.min(24, band - 2);
  const y = (v) => T + (H - T - B) * (1 - v / max);
  const every = Math.ceil(data.length / 6);
  const ticks = [0, max / 2, max];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="chart-svg" role="img" aria-label={title}>
      {ticks.map((t) => (
        <g key={t}>
          <line x1={L} x2={W} y1={y(t)} y2={y(t)} className="chart-grid" />
          <text x={L - 6} y={y(t) + 3} className="chart-axis" textAnchor="end">{Number.isInteger(t) ? t : t.toFixed(1)}</text>
        </g>
      ))}
      {data.map((d, i) => {
        const x = L + band * i + (band - barW) / 2;
        const h = Math.max(0, y(0) - y(d.value));
        const r = Math.min(4, h / 2, barW / 2);
        // rounded at the data end, square at the baseline
        const path = h > 0
          ? `M${x},${y(0)} V${y(d.value) + r} Q${x},${y(d.value)} ${x + r},${y(d.value)} H${x + barW - r} Q${x + barW},${y(d.value)} ${x + barW},${y(d.value) + r} V${y(0)} Z`
          : null;
        return (
          <Tooltip key={d.label} title={d.tip || `${d.label}: ${d.value}`} placement="top" arrow>
            <g tabIndex={0} className="chart-hit" aria-label={d.tip || `${d.label}: ${d.value}`}>
              <rect x={L + band * i} y={T} width={band} height={H - T - B} fill="transparent" />
              {path && <path d={path} className="chart-bar" />}
              {i % every === 0 && <text x={x + barW / 2} y={H - 5} className="chart-axis" textAnchor="middle">{d.label}</text>}
            </g>
          </Tooltip>
        );
      })}
    </svg>
  );
}

/** Horizontal bars for ranking categories. data: [{ label, value }] */
export function RankBars({ data, unit = '' }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="rank-bars">
      {data.map((d) => (
        <Tooltip key={d.label} title={`${d.label}: ${d.value}${unit}`} placement="top" arrow>
          <div className="rank-row" tabIndex={0}>
            <span className="rank-label ellipsis">{d.label}</span>
            <span className="rank-track"><span className="rank-fill" style={{ width: `${(d.value / max) * 100}%` }} /></span>
            <span className="rank-value">{d.value}</span>
          </div>
        </Tooltip>
      ))}
    </div>
  );
}

/** "Show as table" toggle under a chart. */
export function ChartTable({ columns, rows }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-sm">
      <button type="button" className="link-btn tiny" onClick={() => setOpen(!open)}>{open ? 'Hide table' : 'Show as table'}</button>
      {open && (
        <table className="chart-table">
          <thead><tr>{columns.map((c) => <th key={c}>{c}</th>)}</tr></thead>
          <tbody>{rows.map((r, i) => <tr key={i}>{r.map((v, j) => <td key={j}>{v}</td>)}</tr>)}</tbody>
        </table>
      )}
    </div>
  );
}
