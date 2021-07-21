const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const StudentSchema = new Schema({
    username: String,
    email: String,
    password: String,
    confirmPassword: String,
    selected: Number,
    tasks : Array
});

module.exports = mongoose.model('Student', StudentSchema);
