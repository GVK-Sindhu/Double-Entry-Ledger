const db = require("../db");
const { v4: uuidv4 } = require("uuid");

exports.createAccount = async (req, res) => {
  try {
    const { userId, type, currency } = req.body;

    if (!userId || !type || !currency) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const accountId = uuidv4();

    await db.query(
      `INSERT INTO accounts (id, user_id, account_type, currency, status)
       VALUES (?, ?, ?, ?, 'active')`,
      [accountId, userId, type, currency]
    );

    res.status(201).json({ accountId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const ledgerService = require("../services/ledgerService");

exports.getAccountBalance = async (req, res) => {
  try {
    const { accountId } = req.params;
    const balance = await ledgerService.getBalance(accountId);
    res.json({ accountId, balance });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getLedger = async (req, res) => {
  try {
    const { accountId } = req.params;
    const entries = await ledgerService.getLedger(accountId);
    res.json(entries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
