import mongoose from 'mongoose';

const bannerSchema = mongoose.Schema({

    image: {
        type: String,
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    bannerType: {
        type: String,
        default: 'Home'
    },
    isActive: {
        type: Boolean,
        default: false
    },
    slug: {
        type: String,
        default: ''
    },

},
    {
        timestamps: true
    }
)




const banner = mongoose.model('banner', bannerSchema)

export default banner
