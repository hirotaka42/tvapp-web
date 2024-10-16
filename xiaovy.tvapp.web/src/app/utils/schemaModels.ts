import mongoose from "mongoose";

const Schema = mongoose.Schema;
const UserSchema = new Schema({
    firstname: String,
    lastname: String,
    birsday: String,
    email: String,
    emailConfirmed: Boolean,
    phoneNamber: String,
    phoneNamberConfirmed: Boolean,
    password_hash: String,
    date: {
        type: Date,
        default: Date.now
    },
    IsDeleted: Boolean
});

export const UserModel = mongoose.models.User || mongoose.model('User', UserSchema);