import mongoose from 'mongoose';


const randomValuesSchema = mongoose.Schema({

    price: {
        type: Number,
        required: true,
    },
    result: {
        type: Number,
        required: true,
    },
    color: {
        type: String,
        required: true,
    },
    timer: {
        type: Number,
        required: true,
    },
    dayOfWeeks: {
        type: String,
        default: 'Day 1'
    }

},
    {
        timestamps: true
    }
)


const RandomValues = mongoose.model('randomValues', randomValuesSchema)

export default RandomValues