let mongoose = require('mongoose');

var taskSchema = mongoose.Schema({
    taskID: {
        type: Number,
        required: true
    },
    tName: String,
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Developer'
    },
    tDue: {
        type: Date,
        default: Date.now
    },
    tStatus: {
        type: String,
        required: true
    },
    tDesc: String
});

module.exports = mongoose.model('Task', taskSchema);