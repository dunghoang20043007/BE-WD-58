import mongoose from "mongoose";

// user model
const userSchema = new mongoose.Schema(
    {
        avatar: {
            type: String,
            default: "https://i.pinimg.com/736x/bc/43/98/bc439871417621836a0eeea768d60944.jpg",
        },
        userName: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        phone: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true,
            min: 6,
        },
        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user",
        },
        isBlocked: {
            type: Boolean,
            default: false,
        },
    },
    { versionKey: false, timestamps: true },
);

const User = mongoose.model("User", userSchema);
export default User;
