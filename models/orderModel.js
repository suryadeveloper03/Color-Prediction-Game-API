import mongoose from 'mongoose';

const orderSchema = mongoose.Schema({

    transactionId: {
        type: String,
        required: true,
    },
    userId: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "user"
    },
    amount: {
        type: Number,
        required: true,
    },
    status: {
        type: Number,
        default: 1
    }

},
    {
        timestamps: true
    }
)




const Order = mongoose.model('order', orderSchema)

export default Order