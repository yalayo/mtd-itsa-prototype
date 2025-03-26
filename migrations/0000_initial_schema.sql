-- Create users table
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  full_name TEXT NOT NULL,
  business_type TEXT NOT NULL,
  base_currency TEXT NOT NULL
);

-- Create currencies table
CREATE TABLE currencies (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  symbol TEXT NOT NULL,
  rate REAL NOT NULL
);

-- Create categories table
CREATE TABLE categories (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  user_id INTEGER REFERENCES users(id)
);

-- Create transactions table
CREATE TABLE transactions (
  id INTEGER PRIMARY KEY,
  type TEXT NOT NULL,
  user_id INTEGER REFERENCES users(id),
  date TEXT NOT NULL,
  currency TEXT NOT NULL,
  description TEXT NOT NULL,
  amount TEXT NOT NULL,
  converted_amount TEXT NOT NULL,
  category_id INTEGER REFERENCES categories(id)
);

-- Create tax_reports table
CREATE TABLE tax_reports (
  id INTEGER PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  status TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  year INTEGER NOT NULL,
  quarter INTEGER NOT NULL,
  total_income TEXT NOT NULL,
  total_expenses TEXT NOT NULL,
  tax_due TEXT NOT NULL,
  submission_date TEXT,
  hmrc_reference TEXT
);

-- Insert initial data for currencies
INSERT INTO currencies (code, name, symbol, rate) VALUES
  ('GBP', 'British Pound', '£', 1.0),
  ('USD', 'US Dollar', '$', 1.31),
  ('EUR', 'Euro', '€', 1.18),
  ('CAD', 'Canadian Dollar', 'C$', 1.78),
  ('AUD', 'Australian Dollar', 'A$', 1.92);