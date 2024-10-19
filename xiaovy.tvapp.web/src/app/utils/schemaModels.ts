import mongoose from "mongoose";
import { v4 as uuidv4 } from 'uuid';

const Schema = mongoose.Schema;
const UserRegisterSchema = new Schema({
    Uid : {
        type: String,
        unique: true,
        default: uuidv4
    },
    FirstName: {
        type: String,
        required: true
    },
    LastName: {
        type: String,
        required: true
    },
    BirthDay: {
        type: String,
        default: null
    },
    Email: {
        type: String,
        required: true,
        unique: true
    },
    EmailConfirmed: {
        type: Boolean,
        default: false
    },
    PhoneNumber: {
        type: String,
        default: null
    },
    PhoneNumberConfirmed: {
        type: Boolean,
        default: false
    },
    Password_hash: {
        type: String,
        required: true
    },
    Date: {
        type: Date,
        default: Date.now
    },
    IsDeleted: {
        type: Boolean,
        default: false
    },
});

export const UserRegisterModel = mongoose.models.User || mongoose.model('User', UserRegisterSchema);