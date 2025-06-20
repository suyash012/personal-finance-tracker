from flask import Flask, jsonify, request
import pandas as pd
from datetime import datetime, timedelta
import os

app = Flask(__name__)

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'})

@app.route('/suggestions', methods=['POST'])
def suggestions():
    data = request.get_json()
    if not data or 'expenses' not in data:
        return jsonify({'error': 'No expense data provided.'}), 400
    df = pd.DataFrame(data['expenses'])
    if df.empty:
        return jsonify({'suggestions': []})
    # Filter last 30 days
    df['date'] = pd.to_datetime(df['date'])
    # Make all dates timezone-naive for comparison
    if df['date'].dt.tz is not None:
        df['date'] = df['date'].dt.tz_localize(None)
    last_30 = datetime.now()
    df = df[df['date'] >= last_30 - timedelta(days=30)]
    suggestions = []
    # Example: Suggest reducing top category by 15%
    if not df.empty:
        top_cat = df.groupby('category')['amount'].sum().idxmax()
        top_amt = df.groupby('category')['amount'].sum().max()
        suggestions.append(f"You're spending a lot on {top_cat}. Try to reduce it by 15%.")
        # Example: Detect increased spending in 'Travel'
        if 'Travel' in df['category'].values:
            travel_this = df[df['category']=='Travel']['amount'].sum()
            travel_prev = 0
            prev_df = df[df['date'] < (datetime.now() - timedelta(days=15))]
            if not prev_df.empty:
                travel_prev = prev_df[prev_df['category']=='Travel']['amount'].sum()
            if travel_this > travel_prev * 1.2:
                suggestions.append("Your travel expenses increased a lot this month.")
    return jsonify({'suggestions': suggestions})

@app.route('/report', methods=['POST'])
def report():
    data = request.get_json()
    if not data or 'expenses' not in data or 'budgets' not in data:
        return jsonify({'error': 'No expense or budget data provided.'}), 400
    expenses = data['expenses']
    budgets = data['budgets']
    df = pd.DataFrame(expenses)
    if df.empty:
        return jsonify({
            'total_spent': 0,
            'top_category': None,
            'overbudget_categories': []
        })
    df['amount'] = pd.to_numeric(df['amount'], errors='coerce').fillna(0)
    total_spent = float(df['amount'].sum())
    # Top category
    if not df.empty:
        top_category = str(df.groupby('category')['amount'].sum().idxmax())
    else:
        top_category = None
    # Overbudget categories
    overbudget = []
    if budgets:
        budget_df = pd.DataFrame(budgets)
        for _, row in budget_df.iterrows():
            cat = row.get('category')
            limit = float(row.get('limit', 0))
            spent = float(df[df['category'] == cat]['amount'].sum())
            if spent > limit:
                overbudget.append(str(cat))
    return jsonify({
        'total_spent': total_spent,
        'top_category': top_category,
        'overbudget_categories': overbudget
    })

if __name__ == '__main__':
    # Use port from environment variable on Render, default to 8000 locally
    port = int(os.environ.get('PORT', 8000))
    # debug=False is important for production
    # host='0.0.0.0' makes it accessible from outside the container
    app.run(debug=False, host='0.0.0.0', port=port) 