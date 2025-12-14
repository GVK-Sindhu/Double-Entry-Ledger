const express = require("express");
const router = express.Router();
const accountController = require("../controllers/accountController");

router.post("/", accountController.createAccount);
router.get("/:accountId/balance", accountController.getAccountBalance);
router.get("/:accountId/ledger", accountController.getLedger);

module.exports = router;
