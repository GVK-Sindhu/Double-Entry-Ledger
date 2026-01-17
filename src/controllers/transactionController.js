const ledgerService = require("../services/ledgerService");

exports.deposit = async (req, res) => {
  try {
    const { accountId, amount } = req.body;

    if (!accountId || !amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid deposit data" });
    }

    await ledgerService.deposit(accountId, amount);

    res.status(201).json({
      message: "Deposit successful",
      accountId,
      amount,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.transfer = async (req, res) => {
  try {
    const { fromAccountId, toAccountId, amount } = req.body;

    if (!fromAccountId || !toAccountId || amount <= 0) {
      return res.status(400).json({ error: "Invalid transfer data" });
    }

    await ledgerService.transfer(fromAccountId, toAccountId, amount);

    res.status(201).json({
      message: "Transfer successful",
      fromAccountId,
      toAccountId,
      amount,
    });
  } catch (err) {
    if (err.message === "INSUFFICIENT_FUNDS") {
      return res.status(422).json({ error: "Insufficient funds" });
    }
    res.status(500).json({ error: err.message });
  }
};

exports.withdraw = async (req, res) => {
  try {
    const { accountId, amount } = req.body;

    if (!accountId || amount <= 0) {
      return res.status(400).json({ error: "Invalid withdrawal data" });
    }

    await ledgerService.withdraw(accountId, amount);

    res.status(201).json({
      message: "Withdrawal successful",
      accountId,
      amount,
    });
  } catch (err) {
    if (err.message === "INSUFFICIENT_FUNDS") {
      return res.status(422).json({ error: "Insufficient funds" });
    }
    res.status(500).json({ error: err.message });
  }
};
