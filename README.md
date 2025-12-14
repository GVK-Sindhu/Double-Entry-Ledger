# Double-Entry Financial Ledger API

## Overview

This project implements a **robust financial ledger API** based on **double-entry bookkeeping principles**.  
It serves as the backend for a mock banking system, ensuring **absolute data integrity, auditability, and correctness**.

The system goes beyond simple CRUD operations and focuses on:
- ACID-compliant financial transactions
- Immutable ledger records
- Strict balance integrity
- Concurrency safety

---

## Core Concepts Implemented

### 1. Double-Entry Bookkeeping

Every financial transfer creates **exactly two ledger entries**:
- One **debit** from the source account
- One **credit** to the destination account

The net sum of these entries is always zero, ensuring accounting correctness.

Deposits create a single **credit** entry, while withdrawals create a single **debit** entry.

---

### 2. ACID Transactions

All financial operations are executed inside **database transactions**:
BEGIN→ Validate account balance→ Insert transaction record→ Insert ledger entry/entriesCOMMIT
sql
Copy code
 If any step fails, the transaction is **rolled back** completely.  This guarantees: - **Atomicity** – All steps succeed or none do - **Consistency** – Database rules are always preserved - **Isolation** – Concurrent requests do not corrupt data - **Durability** – Committed data is permanent  ---  ### 3. Transaction Isolation & Concurrency Safety  - **Isolation Level:** `READ COMMITTED` - **Row-level locking:** `SELECT ... FOR UPDATE`  **Why this choice?** - Prevents dirty reads - Avoids race conditions during concurrent transfers - Ensures balance checks remain correct under load  ---  ### 4. Immutable Ledger Design  Ledger entries are **append-only**: - ❌ No UPDATE - ❌ No DELETE  Immutability is enforced at the **database level** using triggers:  ```sql CREATE TRIGGER prevent_ledger_update BEFORE UPDATE ON ledger_entries FOR EACH ROW SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Ledger entries are immutable';  CREATE TRIGGER prevent_ledger_delete BEFORE DELETE ON ledger_entries FOR EACH ROW SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Ledger entries are immutable'; 
This guarantees a permanent audit trail.
5. Balance Calculation (No Stored Balance)
Account balance is never stored in the database.
Instead, it is calculated dynamically from the ledger:
sql
Copy code
SUM(   CASE     WHEN entry_type = 'credit' THEN amount     ELSE -amount   END ) 
This ensures:
Balances are always consistent with transaction history
No risk of data drift
Ledger is the single source of truth
6. Overdraft Prevention
Before any debit operation:
The current balance is calculated inside the same DB transaction
If balance < requested amount → transaction is rejected
The entire transaction is rolled back
The API returns:
422 Unprocessable Entity for insufficient funds
API Endpoints
Accounts
POST /accounts – Create a new account
GET /accounts/{accountId}/balance – Get current balance
GET /accounts/{accountId}/ledger – Get full ledger history
Transactions
POST /transactions/deposit – Deposit funds
POST /transactions/withdraw – Withdraw funds
POST /transactions/transfer – Transfer between accounts
Database Schema
Tables
accounts
transactions
ledger_entries
Key Properties
Strong foreign key constraints
High-precision DECIMAL(18,2) for monetary values
No balance column anywhere in the schema
Project Structure
css
Copy code
src/ ├── app.js ├── db.js ├── controllers/ │   ├── accountController.js │   └── transactionController.js ├── services/ │   └── ledgerService.js ├── routes/ │   ├── accounts.js │   └── transactions.js 
Setup Instructions
1. Install Dependencies
bash
Copy code
npm install 
2. Configure Database
MySQL 8+
Create database double_entry_ledger
Run schema SQL
Create immutability triggers
3. Environment Variables
Create .env file:
ini
Copy code
DB_HOST=localhost DB_USER=ledger_user DB_PASSWORD=ledger123 DB_NAME=double_entry_ledger DB_PORT=3306 
4. Run Server
bash
Copy code
node src/app.js 
Testing
A Postman collection is provided to test:
Account creation
Deposits
Withdrawals
Transfers
Ledger retrieval
Balance validation
Evaluation Notes
This system guarantees:
Correct double-entry accounting
ACID-safe financial operations
Strict overdraft prevention
Immutable transaction history
Concurrency-safe transfers
Clean separation of concerns
Conclusion
This project demonstrates a production-grade financial ledger design, emphasizing correctness, reliability, and auditability — core requirements for real-world banking systems.
