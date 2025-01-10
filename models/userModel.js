import mongoose from "mongoose";
import bcrypt from "bcrypt";

const bonusWithdrawsSchema = mongoose.Schema({
    amount: {
        type: Number,
        required: true
    }
}, {
    timestamps: true,
})

const bankSchema = mongoose.Schema({

    name: {
        type: String,
        required: true
    },
    ifscCode: {
        type: String,
        required: true
    },
    bankName: {
        type: String,
        required: true
    },
    accountNo: {
        type: String,
        required: true
    },
    mobile: {
        type: Number,
        required: true
    },
    upiId: {
        type: String,
        required: true
    }

}, {
    timestamps: true,
})

const userSchema = mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    phone: {
        type: Number,
        required: true,
        unique: true
    },
    profilepic: {
        type: String,
        default: ""
    },
    isActive: {
        type: Boolean,
        default: true
    },
    referalCode: {
        type: String,
        required: true
    },
    ownCode: {
        type: String,
        required: true
    },
    wallet: {
        type: Number,
        required: true,
        default: 0
    },
    bonus: {
        amount: {
            type: Number,
            default: 0
        },
        level1: {
            type: Number,
            default: 0
        },
        level2: {
            type: Number,
            default: 0
        },
    },
    bankDetails: [bankSchema],
    bonusWithdrawReports: [bonusWithdrawsSchema],
    lastLoginIp: {
        type: String,
        default: ""
    },
    lastLoginDate: {
        type: Date,
        default: new Date()
    }



},
    {
        timestamps: true
    }
)

userSchema.index({ location: '2dsphere' });

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password)
}

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next()
    }
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
})

const user = mongoose.model('user', userSchema)

export default user