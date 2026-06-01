'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

const statusColors: Record<string, string> = {
  'PENDING': '#C5A059',
  'ASSIGNED': '#7C3AED',
  'IN TRANSIT': '#075985',
  'DELIVERED': '#2D6A4F',
  'CANCELLED': '#DC2626',
}

const typeColors = ['#03271a', '#526347', '#C5A059', '#718096', '#A0AEC0']

const chartCard = 'bg-surface-high rounded-xl border border-outline-ghost p-6'

const axisStyle = {
  fontSize: 10,
  fontFamily: 'var(--font-manrope), sans-serif',
  fill: '#526347',
}

const tooltipStyle = {
  contentStyle: {
    backgroundColor: '#FFFFFF',
    border: '1px solid rgba(193, 200, 194, 0.3)',
    borderRadius: '12px',
    fontSize: '13px',
    fontFamily: 'var(--font-manrope), sans-serif',
    color: '#1A2E22',
    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
  },
}

export function AnalyticsCharts({
  statusData,
  typeData,
  topDrivers,
}: {
  statusData: { name: string; count: number }[]
  typeData: { name: string; count: number }[]
  topDrivers: { name: string; count: number }[]
}) {
  const empty = statusData.length === 0

  return (
    <div className="space-y-8">
      <div className={chartCard}>
        <h3 className="font-display text-xl text-primary mb-6">Shipments by Status</h3>
        {empty ? (
          <EmptyChart />
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={statusData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(193, 200, 194, 0.15)" vertical={false} />
              <XAxis dataKey="name" tick={axisStyle} axisLine={false} tickLine={false} />
              <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={48}>
                {statusData.map((entry) => (
                  <Cell key={entry.name} fill={statusColors[entry.name] || '#526347'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className={chartCard}>
          <h3 className="font-display text-xl text-primary mb-6">By Shipment Type</h3>
          {empty ? (
            <EmptyChart />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={typeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="count"
                  stroke="none"
                >
                  {typeData.map((_, index) => (
                    <Cell key={index} fill={typeColors[index % typeColors.length]} />
                  ))}
                </Pie>
                <Tooltip {...tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          )}
          <div className="flex flex-wrap gap-4 mt-4 justify-center">
            {typeData.map((t, i) => (
              <div key={t.name} className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: typeColors[i % typeColors.length] }}
                />
                <span className="font-sans text-xs text-secondary">{t.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={chartCard}>
          <h3 className="font-display text-xl text-primary mb-6">Top Drivers</h3>
          {topDrivers.length === 0 ? (
            <EmptyChart />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={topDrivers}
                layout="vertical"
                margin={{ top: 0, right: 0, left: 8, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(193, 200, 194, 0.15)" horizontal={false} />
                <XAxis type="number" tick={axisStyle} axisLine={false} tickLine={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={axisStyle}
                  axisLine={false}
                  tickLine={false}
                  width={90}
                />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="count" fill="#526347" radius={[0, 4, 4, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  )
}

function EmptyChart() {
  return (
    <div className="flex items-center justify-center h-[300px]">
      <p className="font-sans text-sm text-secondary">No data available yet.</p>
    </div>
  )
}
