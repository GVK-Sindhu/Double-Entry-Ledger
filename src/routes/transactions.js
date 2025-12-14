const express = require("express");
const router = express.Router();
const transactionController = require("../controllers/transactionController");

router.post("/deposit", transactionController.deposit);

module.exports = router;
router.post("/transfer", transactionController.transfer);
