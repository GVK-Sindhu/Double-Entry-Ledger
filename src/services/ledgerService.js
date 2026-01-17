const db = require("../db");
const { v4: uuidv4 } = require("uuid");

/* ===============================
   Calculate balance from ledger
   =============================== */
exports.getBalance = async (accountId) => {
  const [rows] = await db.query(
    `
    SELECT COALESCE(
      SUM(
        CASE
          WHEN entry_type = 'credit' THEN amount
          ELSE -amount
        END
      ), 0
    ) AS balance
    FROM ledger_entries
    WHERE account_id = ?
    `,
    [accountId]
  );

  return rows[0].balance;
};

/* ===============================
   Deposit money (single-entry)
   =============================== */
exports.deposit = async (accountId, amount) => {
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    const transactionId = uuidv4();

    // Transaction record
    await conn.query(
      `
      INSERT INTO transactions
      (id, type, destination_account_id, amount, currency, status)
      VALUES (?, 'deposit', ?, ?, 'INR', 'completed')
      `,
      [transactionId, accountId, amount]
    );

    // Ledger CREDIT entry
    await conn.query(
      `
      INSERT INTO ledger_entries
      (id, account_id, transaction_id, entry_type, amount)
      VALUES (?, ?, ?, 'credit', ?)
      `,
      [uuidv4(), accountId, transactionId, amount]
    );

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

/* ===============================
   Withdraw money (single-entry)
   =============================== */
exports.withdraw = async (accountId, amount) => {
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    // Lock account row
    await conn.query(
      `SELECT id FROM accounts WHERE id = ? FOR UPDATE`,
      [accountId]
    );

    // Check balance
    const [rows] = await conn.query(
      `
      SELECT COALESCE(
        SUM(
          CASE
            WHEN entry_type = 'credit' THEN amount
            ELSE -amount
          END
        ), 0
      ) AS balance
      FROM ledger_entries
      WHERE account_id = ?
      `,
      [accountId]
    );

    if (rows[0].balance < amount) {
      throw new Error("INSUFFICIENT_FUNDS");
    }

    const transactionId = uuidv4();

    // Transaction record
    await conn.query(
      `
      INSERT INTO transactions
      (id, type, source_account_id, amount, currency, status)
      VALUES (?, 'withdraw', ?, ?, 'INR', 'completed')
      `,
      [transactionId, accountId, amount]
    );

    // Ledger DEBIT entry
    await conn.query(
      `
      INSERT INTO ledger_entries
      (id, account_id, transaction_id, entry_type, amount)
      VALUES (?, ?, ?, 'debit', ?)
      `,
      [uuidv4(), accountId, transactionId, amount]
    );

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

/* ===============================
   Transfer money (double-entry)
   =============================== */
exports.transfer = async (fromAccountId, toAccountId, amount) => {
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    // Lock source account
    await conn.query(
      `SELECT id FROM accounts WHERE id = ? FOR UPDATE`,
      [fromAccountId]
    );

    // Check balance
    const [rows] = await conn.query(
      `
      SELECT COALESCE(
        SUM(
          CASE
            WHEN entry_type = 'credit' THEN amount
            ELSE -amount
          END
        ), 0
      ) AS balance
      FROM ledger_entries
      WHERE account_id = ?
      `,
      [fromAccountId]
    );

    if (rows[0].balance < amount) {
      throw new Error("INSUFFICIENT_FUNDS");
    }

    const transactionId = uuidv4();

    // Transaction record
    await conn.query(
      `
      INSERT INTO transactions
      (id, type, source_account_id, destination_account_id, amount, currency, status)
      VALUES (?, 'transfer', ?, ?, ?, 'INR', 'completed')
      `,
      [transactionId, fromAccountId, toAccountId, amount]
    );

    // Debit source account
    await conn.query(
      `
      INSERT INTO ledger_entries
      (id, account_id, transaction_id, entry_type, amount)
      VALUES (?, ?, ?, 'debit', ?)
      `,
      [uuidv4(), fromAccountId, transactionId, amount]
    );

    // Credit destination account
    await conn.query(
      `
      INSERT INTO ledger_entries
      (id, account_id, transaction_id, entry_type, amount)
      VALUES (?, ?, ?, 'credit', ?)
      `,
      [uuidv4(), toAccountId, transactionId, amount]
    );

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

/* ===============================
   Get ledger for account
   =============================== */
exports.getLedger = async (accountId) => {
  const [rows] = await db.query(
    `
    SELECT
      id,
      transaction_id,
      entry_type,
      amount,
      created_at
    FROM ledger_entries
    WHERE account_id = ?
    ORDER BY created_at ASC
    `,
    [accountId]
  );

  return rows;
};
