import mongoose from 'mongoose';


const bonusReportsSchema = mongoose.Schema({

    userId: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "user"
    },
    level1Id: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "user"
    },
    level2Id: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "user"
    },
    level1Amount: {
        type: Number,
        required: true,
    },
    level2Amount: {
        type: Number,
        required: true,
    },
    tradeAmount: {
        type: Number,
        required: true
    }

},
    {
        timestamps: true
    }
)


const BonusReport = mongoose.model('bonusReport', bonusReportsSchema)

export default BonusReport