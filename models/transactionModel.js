import mongoose from "mongoose";


const transactionsSchema = mongoose.Schema({

    userId: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "user"
    },
    amount: {
        type: Number,
        min: 50,
        default: 50
    },
    actionType: {
        type: String,
        default: "Recharge"
    },
    orderId: {
        type: String,
        required: true
    },
    paymentId: {
        type: String,
        default: ""
    },
    paymentStatus: {
        type: String,
        default: "Pending"
    },
    paymentDate: {
        type: Date
    }


}, {
    timestamps: true
}
)




const Transactions = mongoose.model('transactions', transactionsSchema)

export default Transactions