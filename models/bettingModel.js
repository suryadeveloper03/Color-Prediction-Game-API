import mongoose from 'mongoose';


const bettingSchema = mongoose.Schema({

    gameId: {
        type: Number,
        required: true,
    },
    userId: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "user"
    },
    type: {
        type: String,
        default: 'button'
    },
    value: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true
    },
    tab: {
        type: String,
        default: "Parity"
    },
    acceptRule: {
        type: Boolean,
        default: true
    }

},
    {
        timestamps: true
    }
)


const Betting = mongoose.model('betting', bettingSchema)

export default Betting