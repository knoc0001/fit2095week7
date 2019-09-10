let mongoose = require('mongoose');

var developerSchema = mongoose.Schema({
    devName: {
        firstName: {
            type: String,
            required: true},
        lastName: String,
    },
    devLevel: {
        type: String,
        required: true
    },
    devAddress: {
        state: String,
        suburb: String,
        street: String,
        unit: String
    }
});

module.exports = mongoose.model('Developer', developerSchema);