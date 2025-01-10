import mongoose from 'mongoose';


const manualResultSchema = mongoose.Schema({

    switch: {
        type: String,
        default: "Yes"
    },
    tab: {
        type: String,
        default: "Parity"
    },
    isManualResult:{
        type:Boolean,
        default:false
    },
    winnerColors:[] 



},
    {
        timestamps: true
    }
)


const ManualResult = mongoose.model('manualResult', manualResultSchema)

export default ManualResult