import mongoose from "mongoose";
import { v4 as uuidv4 } from 'uuid';

const Schema = mongoose.Schema;
const UserRegisterSchema = new Schema({
    uuid : {
        type: String,
        unique: true,
        default: uuidv4
    },
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    birthday: {
        type: String
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    emailConfirmed: Boolean,
    phoneNumber: {
        type: String
    },
    phoneNumberConfirmed: Boolean,
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

export const UserRegisterModel = mongoose.models.User || mongoose.model('User', UserRegisterSchema);