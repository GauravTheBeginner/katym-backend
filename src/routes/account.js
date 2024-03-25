const { Router } = require("express");
const authMiddleware = require("../middleware");
const { Account } = require("../db/db");
const { default: mongoose } = require("mongoose");

const router = Router();

router.get("/balance", authMiddleware, async (req, res) => {
    const account = await Account.findOne({
        userId: req.userId
    });

    res.json({
        balance: account.balance
    })
});

router.post("/transfer", authMiddleware, async (req, res) => {
    const session = await mongoose.startSession();

    session.startTransaction();
    const { amount, to } = req.body;

    // Fetch the accounts within the transaction
    const account = await Account.findOne({ userId: req.userId }).session(session);

    if (!account || account.balance < amount) {
        await session.abortTransaction();
        return res.status(400).json({
            message: "Insufficient balance"
        });
    }

    const toAccount = await Account.findOne({ userId: to }).session(session);

    if (!toAccount) {
        await session.abortTransaction();
        return res.status(400).json({
            message: "Invalid recipient account"
        });
    }

    // Perform the transfer
    account.balance -= amount;
    toAccount.balance = Math.floor(toAccount.balance + parseFloat(amount));

    // Save the updated balances
    await account.save({ session });
    await toAccount.save({ session });

    // Commit the transaction
    await session.commitTransaction();
    
    res.json({
        message: "Transfer successful"
    });
});

module.exports = router;