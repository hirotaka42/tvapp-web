import mongoose from "mongoose";

const Schema = mongoose.Schema;
const UserRegisterSchema = new Schema({
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    birsday: {
        type: String
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    emailConfirmed: Boolean,
    phoneNamber: {
        type: String
    },
    phoneNamberConfirmed: Boolean,
    password_hash: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    IsDeleted: {
        type: Boolean,
        default: false
    },
});

export const UserRegisterModel = mongoose.models.UserRegister || mongoose.model('UserRegister', UserRegisterSchema);