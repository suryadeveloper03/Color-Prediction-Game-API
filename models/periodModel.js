import mongoose from 'mongoose';


const periodSchema = mongoose.Schema({

    gameId: {
        type: Number,
        required: true,
    },
    results: {
        type: Array,
        default: []
    },

},
    {
        timestamps: true
    }
)


const Period = mongoose.model('period', periodSchema)

export default Period