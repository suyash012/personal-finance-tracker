import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../AuthContext';
import './Budgets.css';

const categories = [
  'Food', 'Rent', 'Shopping', 'Travel', 'Utilities', 'Health', 'Entertainment', 'Other'
];

function BudgetForm({ onSave, initial, onCancel }) {
  const [category, setCategory] = useState(initial?.category || 'Food');
  const [limit, setLimit] = useState(initial?.limit || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ category, limit: Number(limit) });
  };

  return (
    <form onSubmit={handleSubmit} className="budget-form">
      <div className="form-row">
        <select value={category} onChange={e => setCategory(e.target.value)}>
          {categories.map(c => <option key={c}>{c}</option>)}
        </select>
        <input type="number" step="0.01" placeholder="Monthly Limit" value={limit} onChange={e => setLimit(e.target.value)} className="input-limit" required />
      </div>
      <div className="button-group">
        <button type="submit" className="save-btn">Save</button>
        {onCancel && <button type="button" onClick={onCancel} className="cancel-btn">Cancel</button>}
      </div>
    </form>
  );
}

export default function Budgets() {
  const { token } = useContext(AuthContext);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editBudget, setEditBudget] = useState(null);
  const [alerts, setAlerts] = useState({});

  const fetchBudgets = async () => {
    setLoading(true);
    const res = await fetch('/api/budgets', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    setBudgets(data);
    setLoading(false);
    // Fetch alerts for each budget
    const alertObj = {};
    await Promise.all(data.map(async (b) => {
      const r = await fetch(`/api/budgets/status/${b.category}`, { headers: { Authorization: `Bearer ${token}` } });
      alertObj[b.category] = await r.json();
    }));
    setAlerts(alertObj);
  };

  useEffect(() => { fetchBudgets(); }, [token]);

  const handleAdd = async (data) => {
    await fetch('/api/budgets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(data)
    });
    setShowForm(false);
    fetchBudgets();
  };

  const handleDelete = async (id) => {
    await fetch(`/api/budgets/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchBudgets();
  };

  return (
    <div className="budgets-container">
      <div className="budgets-header">
        <h2>Budgets</h2>
        <button onClick={() => { setShowForm(true); setEditBudget(null); }} className="add-budget-btn">Add Budget</button>
      </div>
      {showForm && (
        <BudgetForm onSave={handleAdd} onCancel={() => setShowForm(false)} />
      )}
      {editBudget && (
        <BudgetForm initial={editBudget} onSave={data => handleAdd({ ...data, category: editBudget.category })} onCancel={() => setEditBudget(null)} />
      )}
      {loading ? <div>Loading...</div> : (
        <table className="budgets-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Limit</th>
              <th>Spent</th>
              <th>Alert</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {budgets.map(b => (
              <tr key={b._id}>
                <td>{b.category}</td>
                <td>₹{b.limit}</td>
                <td>₹{alerts[b.category]?.spent ?? '-'}</td>
                <td>
                  {alerts[b.category]?.alert === 'over' && <span className="alert-over">Over Budget!</span>}
                  {alerts[b.category]?.alert === 'warning' && <span className="alert-warning">80% Used</span>}
                  {!alerts[b.category]?.alert && <span className="alert-ok">OK</span>}
                </td>
                <td className="actions-cell">
                  <button onClick={() => setEditBudget(b)} className="edit-btn">Edit</button>
                  <button onClick={() => handleDelete(b._id)} className="delete-btn">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
} 