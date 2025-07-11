-- Commission-based discount system migration

-- Function to execute raw SQL (needed for our backend)
CREATE OR REPLACE FUNCTION exec_sql(sql_query text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql_query;
END;
$$;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('active', 'suspended', 'pending')),
  email_verified BOOLEAN DEFAULT FALSE,
  verification_token VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Wallets table
CREATE TABLE IF NOT EXISTS wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  balance DECIMAL(15,2) DEFAULT 0.00,
  currency VARCHAR(3) DEFAULT 'NGN',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- App settings table for global configurations
CREATE TABLE IF NOT EXISTS app_settings (
  key_name VARCHAR(100) PRIMARY KEY,
  value TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Service providers table (updated for commission system)
CREATE TABLE IF NOT EXISTS service_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('airtime', 'data', 'tv', 'electricity', 'education', 'insurance')),
  code VARCHAR(50) NOT NULL,
  logo_url VARCHAR(500),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  commission_rate DECIMAL(5,2) DEFAULT 0.00,
  commission_type VARCHAR(20) DEFAULT 'percentage' CHECK (commission_type IN ('percentage', 'flat_fee')),
  flat_fee_amount DECIMAL(15,2) DEFAULT 0.00,
  is_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(code, type)
);

-- Service plans table
CREATE TABLE IF NOT EXISTS service_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(50) NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  validity VARCHAR(50),
  description TEXT,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transactions table (updated for discount system)
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('airtime', 'data', 'tv', 'electricity', 'education', 'insurance')),
  amount DECIMAL(15,2) NOT NULL,
  user_discount DECIMAL(15,2) DEFAULT 0.00,
  total_amount DECIMAL(15,2) NOT NULL,
  recipient VARCHAR(255) NOT NULL,
  provider VARCHAR(100) NOT NULL,
  plan_id VARCHAR(100),
  external_reference VARCHAR(255),
  vtpass_reference VARCHAR(255),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed', 'reversed')),
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- API Keys table
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  key_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  permissions JSONB,
  usage_limit INTEGER DEFAULT NULL,
  usage_count INTEGER DEFAULT 0,
  last_used TIMESTAMP NULL,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'revoked')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Wallet transactions table
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(10) NOT NULL CHECK (type IN ('credit', 'debit')),
  amount DECIMAL(15,2) NOT NULL,
  balance_before DECIMAL(15,2) NOT NULL,
  balance_after DECIMAL(15,2) NOT NULL,
  reference VARCHAR(255),
  description TEXT,
  payment_gateway VARCHAR(50),
  gateway_reference VARCHAR(255),
  gateway_response JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payment gateway transactions table
CREATE TABLE IF NOT EXISTS payment_gateway_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  wallet_transaction_id UUID REFERENCES wallet_transactions(id) ON DELETE SET NULL,
  gateway VARCHAR(50) NOT NULL,
  gateway_reference VARCHAR(255) NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'NGN',
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed', 'abandoned')),
  gateway_response JSONB,
  authorization_url TEXT,
  access_code VARCHAR(255),
  callback_url TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  resource VARCHAR(100) NOT NULL,
  resource_id VARCHAR(255),
  old_values JSONB,
  new_values JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_transactions ON transactions(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_external_ref ON transactions(external_reference);
CREATE INDEX IF NOT EXISTS idx_key_hash ON api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions ON wallet_transactions(wallet_id, created_at);
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_logs(action, created_at);
CREATE INDEX IF NOT EXISTS idx_verification_token ON users(verification_token);
CREATE INDEX IF NOT EXISTS idx_gateway_reference ON payment_gateway_transactions(gateway_reference);
CREATE INDEX IF NOT EXISTS idx_gateway_status ON payment_gateway_transactions(status, created_at);
CREATE INDEX IF NOT EXISTS idx_service_providers_enabled ON service_providers(is_enabled, type);
CREATE INDEX IF NOT EXISTS idx_service_providers_code ON service_providers(code);

-- Create triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to tables with updated_at columns
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_wallets_updated_at ON wallets;
CREATE TRIGGER update_wallets_updated_at BEFORE UPDATE ON wallets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_app_settings_updated_at ON app_settings;
CREATE TRIGGER update_app_settings_updated_at BEFORE UPDATE ON app_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_service_providers_updated_at ON service_providers;
CREATE TRIGGER update_service_providers_updated_at BEFORE UPDATE ON service_providers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_service_plans_updated_at ON service_plans;
CREATE TRIGGER update_service_plans_updated_at BEFORE UPDATE ON service_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_transactions_updated_at ON transactions;
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_api_keys_updated_at ON api_keys;
CREATE TRIGGER update_api_keys_updated_at BEFORE UPDATE ON api_keys FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_payment_gateway_transactions_updated_at ON payment_gateway_transactions;
CREATE TRIGGER update_payment_gateway_transactions_updated_at BEFORE UPDATE ON payment_gateway_transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();