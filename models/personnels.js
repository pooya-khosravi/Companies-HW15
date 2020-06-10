const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const personneslSchema = new Schema({
    firstName:{
        type: String,
        required: true,
        trim: true
    },
    lastName:{
        type: String,
        required: true,
        trim: true
    },
    codeMelli:{
        type: Number,
        required: true,
        trim: true
    },
    gender:{
        type: String,
        required: true,
        trim: true
    },
    isManager:{
        type: Boolean,
        required: true
    },
    tavallod:{
        type: Date,
        required: true,
        trim: true
    },
    company:{
        type: Schema.Types.ObjectId,
        ref: "companies",
        required: true
    }
})


module.exports = mongoose.model("personnels", personneslSchema);