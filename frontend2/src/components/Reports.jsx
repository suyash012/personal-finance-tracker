import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../AuthContext';
import './Reports.css';

export default function Reports() {
  const { token } = useContext(AuthContext);
  const [reports, setReports] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const headers = { Authorization: `Bearer ${token}` };
      let reportsData = [];
      let suggestionsData = [];
      let errorMsg = '';
      try {
        const reportsRes = await fetch('/api/reports', { headers });
        const reportsJson = await reportsRes.json();
        if (Array.isArray(reportsJson)) {
          reportsData = reportsJson;
        } else {
          errorMsg = reportsJson.message || 'Failed to fetch reports.';
        }
      } catch (e) {
        errorMsg = 'Failed to fetch reports.';
      }
      setReports(reportsData);
      try {
        const suggRes = await fetch('/api/suggestions', { headers });
        const suggJson = await suggRes.json();
        if (Array.isArray(suggJson.suggestions)) {
          suggestionsData = suggJson.suggestions;
        } else {
          errorMsg = errorMsg || suggJson.message || 'Failed to fetch suggestions.';
        }
      } catch (e) {
        errorMsg = errorMsg || 'Failed to fetch suggestions.';
      }
      setSuggestions(suggestionsData);
      setLoading(false);
      setError(errorMsg);
    }
    fetchData();
  }, [token]);

  return (
    <div className="reports-container">
      <h2>Reports & Suggestions</h2>
      {loading ? <div>Loading...</div> : (
        <>
          {error && <div className="error-message">{error}</div>}
          <div className="suggestions-section">
            <h3>Smart Suggestions</h3>
            {suggestions.length === 0 ? <div>No suggestions at this time.</div> : (
              <ul className="suggestions-list">
                {suggestions.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            )}
          </div>
          <div className="reports-section">
            <h3>Last 3 Months' Reports</h3>
            <table className="reports-table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Total Spent</th>
                  <th>Top Category</th>
                  <th>Overbudget Categories</th>
                </tr>
              </thead>
              <tbody>
                {reports.map(r => (
                  <tr key={r.id || r._id}>
                    <td>{r.month}</td>
                    <td>₹{r.total_spent || r.totalSpent}</td>
                    <td>{r.top_category || r.topCategory}</td>
                    <td>{r.overbudget_categories || r.overbudgetCategories || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
} 