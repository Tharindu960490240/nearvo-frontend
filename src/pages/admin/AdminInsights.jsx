// Growth at a glance: weekly sign-ups and jobs, busiest trades and states.
import { useEffect, useState } from 'react';
import { LuChartColumn as ChartColumn } from 'react-icons/lu';
import { api } from '../../api.js';
import { stateName } from '../../australia.js';
import { ChartTable, ColumnChart, RankBars } from '../../components/BarChart.jsx';
import { InlineLoader } from '../../components/LoadingSpinner.jsx';
import { Alert, Empty, TextInput } from '../../components/ui.jsx';
import { AdminHeader } from './common.jsx';

const SERIES = [
  ['customers', 'New customers'],
  ['tradies', 'New tradies'],
  ['jobs_posted', 'Jobs posted'],
  ['jobs_completed', 'Jobs completed'],
];
const weekLabel = (iso) => new Date(`${iso}T00:00:00`).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });

export default function AdminInsights() {
  const [weeks, setWeeks] = useState('12');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    setData(null);
    api('/admin/charts', { params: { weeks } }).then(setData).catch((e) => setError(e.message));
  }, [weeks]);

  return (
    <div className="container page">
      <AdminHeader title="Insights" subtitle="How Nearvo is growing. Weeks start on Monday."
        action={<div style={{ width: 170 }}><TextInput label="Show" value={weeks} onChange={(e) => setWeeks(e.target.value)} options={[['8', 'Last 8 weeks'], ['12', 'Last 12 weeks'], ['26', 'Last 6 months'], ['52', 'Last 12 months']]} /></div>} />
      {error && <Alert type="error">{error}</Alert>}
      {!data && !error && <InlineLoader compact />}
      {data && (
        <>
          <div className="grid grid-2 mb-lg">
            {SERIES.map(([key, title]) => {
              const total = data.weekly.reduce((n, w) => n + w[key], 0);
              return (
                <div key={key} className="card card-pad">
                  <div className="row-between"><h4>{title}</h4><span className="small muted">{total} in total</span></div>
                  <ColumnChart title={`${title} per week`} data={data.weekly.map((w) => ({ label: weekLabel(w.week), value: w[key], tip: `Week of ${weekLabel(w.week)}: ${w[key]}` }))} />
                  <ChartTable columns={['Week of', title]} rows={data.weekly.map((w) => [weekLabel(w.week), w[key]])} />
                </div>
              );
            })}
          </div>
          <div className="grid grid-2">
            <div className="card card-pad">
              <h4 className="mb">Busiest trades <span className="muted small">(jobs, last 90 days)</span></h4>
              {data.trades.some((t) => t.jobs) ? <RankBars data={data.trades.map((t) => ({ label: t.name, value: t.jobs }))} /> : <Empty icon={ChartColumn} title="No jobs yet" />}
            </div>
            <div className="card card-pad">
              <h4 className="mb">Jobs by state <span className="muted small">(last 90 days)</span></h4>
              {data.states.length ? <RankBars data={data.states.map((s) => ({ label: stateName(s.state), value: s.jobs }))} /> : <Empty icon={ChartColumn} title="No jobs yet" />}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
