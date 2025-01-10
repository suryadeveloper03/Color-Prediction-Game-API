import mongoose from 'mongoose';


const tempWinnersSchema = mongoose.Schema({

    gameId: {
        type: Number,
        required: true,
    },
    number: {
        type: Number,
        required: true,
    },
    color: {
        type: String,
        required: true,
    },
    total: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        default: "Parity"
    }

},
    {
        timestamps: true
    }
)


const TempWinners = mongoose.model('tempWinners', tempWinnersSchema)

export default TempWinners