import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../AuthContext';
import './Expenses.css';

const categories = [
  'Food', 'Rent', 'Shopping', 'Travel', 'Utilities', 'Health', 'Entertainment', 'Other'
];
const paymentMethods = [
  'UPI', 'Credit Card', 'Cash', 'Debit Card', 'Net Banking', 'Other'
];

function ExpenseForm({ onSave, initial, onCancel }) {
  const [amount, setAmount] = useState(initial?.amount || '');
  const [category, setCategory] = useState(initial?.category || 'Food');
  const [date, setDate] = useState(initial?.date ? initial.date.slice(0,10) : '');
  const [paymentMethod, setPaymentMethod] = useState(initial?.paymentMethod || 'UPI');
  const [notes, setNotes] = useState(initial?.notes || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ amount: Number(amount), category, date, paymentMethod, notes });
  };

  return (
    <form onSubmit={handleSubmit} className="expense-form">
      <div className="form-row">
        <input type="number" step="0.01" placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} className="input-amount" required />
        <select value={category} onChange={e => setCategory(e.target.value)}>
          {categories.map(c => <option key={c}>{c}</option>)}
        </select>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} required />
        <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
          {paymentMethods.map(m => <option key={m}>{m}</option>)}
        </select>
      </div>
      <input type="text" placeholder="Notes (optional)" value={notes} onChange={e => setNotes(e.target.value)} className="input-notes" />
      <div className="button-group">
        <button type="submit" className="save-btn">Save</button>
        {onCancel && <button type="button" onClick={onCancel} className="cancel-btn">Cancel</button>}
      </div>
    </form>
  );
}

export default function Expenses() {
  const { token } = useContext(AuthContext);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editExpense, setEditExpense] = useState(null);
  const [filters, setFilters] = useState({ category: '', paymentMethod: '', startDate: '', endDate: '', search: '' });

  const fetchExpenses = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, v); });
    const res = await fetch('/api/expenses?' + params.toString(), {
      headers: { Authorization: `Bearer ${token}` }
    });
    setExpenses(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchExpenses(); }, [token, filters]);

  const handleAdd = async (data) => {
    await fetch('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(data)
    });
    setShowForm(false);
    fetchExpenses();
  };

  const handleEdit = async (id, data) => {
    await fetch(`/api/expenses/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(data)
    });
    setEditExpense(null);
    fetchExpenses();
  };

  const handleDelete = async (id) => {
    await fetch(`/api/expenses/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchExpenses();
  };

  return (
    <div className="expenses-container">
      <div className="expenses-header">
        <h2>Expenses</h2>
        <button onClick={() => { setShowForm(true); setEditExpense(null); }} className="add-expense-btn">Add Expense</button>
      </div>
      <div className="filter-bar">
        <select value={filters.category} onChange={e => setFilters(f => ({ ...f, category: e.target.value }))}>
          <option value="">All Categories</option>
          {categories.map(c => <option key={c}>{c}</option>)}
        </select>
        <select value={filters.paymentMethod} onChange={e => setFilters(f => ({ ...f, paymentMethod: e.target.value }))}>
          <option value="">All Payment Methods</option>
          {paymentMethods.map(m => <option key={m}>{m}</option>)}
        </select>
        <input type="date" value={filters.startDate} onChange={e => setFilters(f => ({ ...f, startDate: e.target.value }))} />
        <input type="date" value={filters.endDate} onChange={e => setFilters(f => ({ ...f, endDate: e.target.value }))} />
        <input type="text" placeholder="Search" value={filters.search} onChange={e => setFilters(f => ({ ...f, search: e.target.value }))} />
        <button onClick={fetchExpenses} className="filter-btn">Filter</button>
      </div>
      {showForm && (
        <ExpenseForm onSave={handleAdd} onCancel={() => setShowForm(false)} />
      )}
      {editExpense && (
        <ExpenseForm initial={editExpense} onSave={data => handleEdit(editExpense._id, data)} onCancel={() => setEditExpense(null)} />
      )}
      {loading ? <div>Loading...</div> : (
        <table className="expenses-table">
          <thead>
            <tr>
              <th>Amount</th>
              <th>Category</th>
              <th>Date</th>
              <th>Payment</th>
              <th>Notes</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map(e => (
              <tr key={e._id}>
                <td>₹{e.amount}</td>
                <td>{e.category}</td>
                <td>{e.date?.slice(0,10)}</td>
                <td>{e.paymentMethod}</td>
                <td>{e.notes}</td>
                <td className="actions-cell">
                  <button onClick={() => setEditExpense(e)} className="edit-btn">Edit</button>
                  <button onClick={() => handleDelete(e._id)} className="delete-btn">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
} 