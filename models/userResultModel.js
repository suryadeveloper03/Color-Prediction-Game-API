import mongoose from 'mongoose';


const userResultSchema = mongoose.Schema({

    userId: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "user"
    },
    gameId: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        default: 'button',
    },
    value: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    openPrice: {
        type: Number,
        required: true
    },
    tab: {
        type: String,
        required: true

    },
    paidAmount: {
        type: Number,
        required: true
    },
    fee: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        default: 'fail'
    }



},
    {
        timestamps: true
    }
)


const UserResult = mongoose.model('userResult', userResultSchema)

export default UserResult