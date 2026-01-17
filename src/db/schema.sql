-- ===============================
-- ACCOUNTS TABLE
-- ===============================
CREATE TABLE IF NOT EXISTS accounts (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  account_type VARCHAR(20) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'INR',
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===============================
-- TRANSACTIONS TABLE
-- ===============================
CREATE TABLE IF NOT EXISTS transactions (
  id VARCHAR(36) PRIMARY KEY,
  type ENUM('deposit', 'withdraw', 'transfer') NOT NULL,
  source_account_id VARCHAR(36),
  destination_account_id VARCHAR(36),
  amount DECIMAL(18,2) NOT NULL,
  currency VARCHAR(3) NOT NULL,
  status ENUM('pending', 'completed', 'failed') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (source_account_id) REFERENCES accounts(id),
  FOREIGN KEY (destination_account_id) REFERENCES accounts(id)
);

-- ===============================
-- LEDGER ENTRIES TABLE (IMMUTABLE)
-- ===============================
CREATE TABLE IF NOT EXISTS ledger_entries (
  id VARCHAR(36) PRIMARY KEY,
  account_id VARCHAR(36) NOT NULL,
  transaction_id VARCHAR(36) NOT NULL,
  entry_type ENUM('debit', 'credit') NOT NULL,
  amount DECIMAL(18,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (account_id) REFERENCES accounts(id),
  FOREIGN KEY (transaction_id) REFERENCES transactions(id)
);

-- ===============================
-- IMMUTABILITY TRIGGERS
-- ===============================

DELIMITER $$

CREATE TRIGGER prevent_ledger_update
BEFORE UPDATE ON ledger_entries
FOR EACH ROW
BEGIN
  SIGNAL SQLSTATE '45000'
  SET MESSAGE_TEXT = 'Ledger entries are immutable';
END$$

CREATE TRIGGER prevent_ledger_delete
BEFORE DELETE ON ledger_entries
FOR EACH ROW
BEGIN
  SIGNAL SQLSTATE '45000'
  SET MESSAGE_TEXT = 'Ledger entries are immutable';
END$$

DELIMITER ;
