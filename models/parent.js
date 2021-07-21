const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ParentSchema = new Schema({
    username: String,
    email: String,
    password: String,
    confirmPassword: String,
    children: Array
});

module.exports = mongoose.model('Parent', ParentSchema);