import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { statsApi } from '../api.js';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
} from 'recharts';
import { TrendingUp, CheckCircle, Clock, XCircle, PlusCircle, ArrowRight } from 'lucide-react';
import './Dashboard.css';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <p className="tooltip-label">{label}</p>
      <p className="tooltip-value">{payload[0]?.value} evaluations</p>
    </div>
  );
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    statsApi.get()
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="loading-state">
      <div className="loading-spinner" />
      <span>Loading dashboard...</span>
    </div>
  );

  const radarData = stats ? [
    { subject: 'Accuracy', A: stats.avgScores?.avg_accuracy || 0, fullMark: 5 },
    { subject: 'Relevance', A: stats.avgScores?.avg_relevance || 0, fullMark: 5 },
    { subject: 'Coherence', A: stats.avgScores?.avg_coherence || 0, fullMark: 5 },
    { subject: 'Helpfulness', A: stats.avgScores?.avg_helpfulness || 0, fullMark: 5 },
  ] : [];

  const statCards = [
    { label: 'Total Evaluations', value: stats?.total || 0, icon: TrendingUp, color: 'accent' },
    { label: 'Approved', value: stats?.approved || 0, icon: CheckCircle, color: 'success' },
    { label: 'Pending Review', value: stats?.pending || 0, icon: Clock, color: 'warn' },
    { label: 'Rejected', value: stats?.rejected || 0, icon: XCircle, color: 'danger' },
  ];

  return (
    <div className="dashboard fade-in">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Platform overview · real-time annotation metrics</p>
      </div>

      {/* Stat Cards */}
      <div className="stat-grid">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className={`stat-card stat-${color}`}>
            <div className="stat-icon">
              <Icon size={18} />
            </div>
            <div className="stat-body">
              <div className="stat-value">{value.toLocaleString()}</div>
              <div className="stat-label">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="chart-grid">
        {/* Activity Chart */}
        <div className="card chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Activity (Last 7 Days)</h3>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={stats?.recentActivity || []}>
              <defs>
                <linearGradient id="accentGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00e5a0" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#00e5a0" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fill: '#8b8fa8', fontSize: 11, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#8b8fa8', fontSize: 11, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="count" stroke="#00e5a0" strokeWidth={2} fill="url(#accentGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Radar Chart */}
        <div className="card chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Avg. Quality Scores</h3>
            <span className="chart-badge">
              Overall: {stats?.avgScores?.avg_overall || '—'}/5
            </span>
          </div>
          {radarData.some(d => d.A > 0) ? (
            <ResponsiveContainer width="100%" height={200}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#1c1c2e" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#8b8fa8', fontSize: 11, fontFamily: 'JetBrains Mono' }} />
                <Radar name="Score" dataKey="A" stroke="#00e5a0" fill="#00e5a0" fillOpacity={0.15} />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-chart">No data yet — start evaluating!</div>
          )}
        </div>
      </div>

      {/* Task Type Breakdown */}
      {stats?.byTaskType?.length > 0 && (
        <div className="card">
          <div className="chart-header">
            <h3 className="chart-title">By Task Type</h3>
          </div>
          <div className="task-type-list">
            {stats.byTaskType.map(row => (
              <div key={row.task_type} className="task-type-row">
                <span className="task-name">{row.task_type}</span>
                <div className="score-bar-wrap" style={{ flex: 1, maxWidth: 300 }}>
                  <div className="score-bar">
                    <div className="score-bar-fill" style={{ width: `${(row.avg_score / 5) * 100}%` }} />
                  </div>
                  <span className="score-label">{row.avg_score}/5</span>
                </div>
                <span className="task-count">{row.count} evals</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      {stats?.total === 0 && (
        <div className="cta-card">
          <div className="cta-icon">🚀</div>
          <h3>Start Your First Evaluation</h3>
          <p>Submit a prompt-response pair and begin annotating LLM outputs.</p>
          <Link to="/evaluate" className="btn btn-primary">
            <PlusCircle size={16} /> New Evaluation <ArrowRight size={14} />
          </Link>
        </div>
      )}
    </div>
  );
}
