-- Insert a sample user
INSERT INTO users (username, password, full_name, business_type, base_currency) VALUES
  ('john.smith', 'password123', 'John Smith', 'sole_trader', 'GBP');

-- Insert sample categories for the user
INSERT INTO categories (name, type, user_id) VALUES
  ('Sales', 'income', 1),
  ('Services', 'income', 1),
  ('Rent', 'expense', 1),
  ('Supplies', 'expense', 1),
  ('Travel', 'expense', 1),
  ('Equipment', 'expense', 1);

-- Insert sample transactions
INSERT INTO transactions (type, user_id, date, currency, description, amount, converted_amount, category_id) VALUES
  ('income', 1, '2025-03-12T00:00:00.000Z', 'GBP', 'Client payment - ABC Corp', '1500.00', '1500.00', 1),
  ('income', 1, '2025-03-10T00:00:00.000Z', 'USD', 'Client payment - XYZ Inc', '2000.00', '1526.72', 1),
  ('expense', 1, '2025-03-08T00:00:00.000Z', 'GBP', 'Office rent - March', '800.00', '800.00', 3),
  ('expense', 1, '2025-03-05T00:00:00.000Z', 'GBP', 'Office supplies', '120.50', '120.50', 4),
  ('expense', 1, '2025-03-01T00:00:00.000Z', 'EUR', 'Business trip - Paris', '450.00', '381.36', 5);

-- Insert a sample tax report
INSERT INTO tax_reports (user_id, status, start_date, end_date, year, quarter, total_income, total_expenses, tax_due, submission_date, hmrc_reference) VALUES
  (1, 'draft', '2023-10-01T00:00:00.000Z', '2023-12-31T00:00:00.000Z', 2023, 4, '12500.00', '4350.00', '1630.00', NULL, NULL);