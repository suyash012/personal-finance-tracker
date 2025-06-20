CREATE TABLE IF NOT EXISTS reports (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  month VARCHAR(7) NOT NULL, -- e.g. '2024-06'
  total_spent NUMERIC NOT NULL,
  top_category VARCHAR(64),
  overbudget_categories TEXT, -- comma-separated
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
); 