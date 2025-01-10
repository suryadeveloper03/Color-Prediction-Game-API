import mongoose from 'mongoose';

const walletReportsSchema = mongoose.Schema({

    userId: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "user"
    },
    gameId: {
        type: Number,
        required: true
    },
    orderId: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "order"
    },
    amount: {
        type: Number,
        required: true,
    },
    type: {
        type: String,
        required: true,
    },
    actionType: {
        type: String,
        required: true,
        default: "Join"
    }

},
    {
        timestamps: true
    }
)




const WalletReport = mongoose.model('walletReport', walletReportsSchema)

export default WalletReport