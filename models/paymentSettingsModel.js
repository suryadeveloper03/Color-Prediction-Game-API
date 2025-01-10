import mongoose from 'mongoose';

const paymentSettingsSchema = mongoose.Schema({

    rechargeAmount: {
        type: Number,
        required: true
    },
    withdrawalAmount: {
        type: Number,
        required: true
    },
    bonusAmount: {
        type: Number,
        required: true
    },
    rechargeBonus: {
        type: Number,
        required: true
    },
    level1Bonus: {
        type: Number,
        required: true
    },
    level2Bonus: {
        type: Number,
        required: true
    },
    minBonusWithdraw: {
        type: Number,
        required: true
    },
    razorPayKey: {
        type: String,
        default: ""
    },
    razorPaySecret: {
        type: String,
        default: ""
    }

},
    {
        timestamps: true
    }
)




const PaymentSettings = mongoose.model('paymentSettings', paymentSettingsSchema)

export default PaymentSettings
