import mongoose from 'mongoose';


const cmsSchema = mongoose.Schema({

    title: {
        type: String,
        required: true
    },
    footerType: {
        type: String,
        required: true
    },
    slug:{
        type:String,
        required:true
    },
    content: {
        type: String,
        default: ""
    },
    isActive: {
        type: Boolean,
        default: true
    }
},
    {
        timestamps: true
    }
)


const cms = mongoose.model('cms', cmsSchema)

export default cms