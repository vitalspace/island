import mongoose, { type Document } from "mongoose";

interface User extends Document {
  address: string;
  isClaimedFirstCoin: boolean;
}

const userSchema = new mongoose.Schema<User>(
  {
    address: {
      type: String,
      required: true,
    },
    isClaimedFirstCoin: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model<User>("User", userSchema);
