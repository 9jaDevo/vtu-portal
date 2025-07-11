/*
  # Add purchased_code column to transactions table

  This migration adds a new column to store purchase codes or tokens returned from service providers,
  particularly for electricity transactions.

  1. Changes
    - Add `purchased_code` column to the transactions table
*/

-- Add the purchased_code column to store tokens and purchase codes
ALTER TABLE IF EXISTS transactions
ADD COLUMN IF NOT EXISTS purchased_code TEXT;

-- Add an index to make lookup by purchase code faster
CREATE INDEX IF NOT EXISTS idx_transactions_purchased_code ON transactions(purchased_code);