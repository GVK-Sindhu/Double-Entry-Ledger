const express = require("express");
const app = express();

const accountRoutes = require("./routes/accounts");
const transactionRoutes = require("./routes/transactions");

app.use(express.json());

app.use("/accounts", accountRoutes);
app.use("/transactions", transactionRoutes);

app.listen(3000, () => {
  console.log("Ledger API running on port 3000");
});
