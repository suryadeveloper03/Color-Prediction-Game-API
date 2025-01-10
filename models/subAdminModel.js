import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const subAdminSchema = mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    subadminAccess: {
        type: Number,
        default: 0
    },
    password: {
        type: String,
        required: true,
    },
    isActive: {
        type: Boolean,
        default: true
    },
    permissions: {
        type: Object,
        default: {
            "Subadmin": [],
            "User": [],
            "CMS": [],
            "Banner": []
        }
    }

}, {
    timestamps: true,
})
subAdminSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password)
}
subAdminSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next()
    }
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
})

const SubAdmin = mongoose.model('subAdmin', subAdminSchema)

export default SubAdmin
