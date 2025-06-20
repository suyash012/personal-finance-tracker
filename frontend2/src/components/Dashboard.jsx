import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../AuthContext';
import { Pie, Line } from 'react-chartjs-2';
import './Dashboard.css';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title);

export default function Dashboard() {
  const { token } = useContext(AuthContext);
  const [summary, setSummary] = useState(null);
  const [pieData, setPieData] = useState(null);
  const [lineData, setLineData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const headers = { Authorization: `Bearer ${token}` };
      const [summaryRes, pieRes, lineRes] = await Promise.all([
        fetch('/api/dashboard/summary', { headers }),
        fetch('/api/dashboard/pie', { headers }),
        fetch('/api/dashboard/line', { headers })
      ]);
      setSummary(await summaryRes.json());
      setPieData(await pieRes.json());
      setLineData(await lineRes.json());
      setLoading(false);
    }
    fetchData();
  }, [token]);

  if (loading || !summary || !pieData || !lineData) return <div className="loading-text">Loading dashboard...</div>;

  // Pie chart data
  const pieChartData = {
    labels: Object.keys(pieData),
    datasets: [
      {
        data: Object.values(pieData),
        backgroundColor: [
          '#60a5fa', '#f472b6', '#fbbf24', '#34d399', '#a78bfa', '#f87171', '#4ade80', '#facc15'
        ],
      },
    ],
  };

  // Line chart data
  const lineChartData = {
    labels: Object.keys(lineData),
    datasets: [
      {
        label: 'Spending',
        data: Object.values(lineData),
        fill: false,
        borderColor: '#60a5fa',
        tension: 0.1,
      },
    ],
  };

  return (
    <div className="dashboard-container">
      <h2>Dashboard</h2>
      <div className="summary-grid">
        <div className="summary-card">
          <div className="label">Total Spent (This Month)</div>
          <div className="value-large">₹{summary.totalSpent}</div>
        </div>
        <div className="summary-card">
          <div className="label">Top Category</div>
          <div className="value-medium">{summary.topCategory || '-'}</div>
        </div>
        <div className="summary-card">
          <div className="label">Top Payment Methods</div>
          <div className="value-normal">{summary.topPaymentMethods?.join(', ') || '-'}</div>
        </div>
      </div>
      <div className="chart-grid">
        <div className="chart-card">
          <div className="chart-title">Category-wise Spending</div>
          <Pie data={pieChartData} />
        </div>
        <div className="chart-card">
          <div className="chart-title">Spending Over Time</div>
          <Line data={lineChartData} />
        </div>
      </div>
    </div>
  );
} 