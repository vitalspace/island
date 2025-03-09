import { Context, error } from "elysia";
import { ethers } from "ethers";
import { User } from "../models/user.model";

export const createUser = async (ctx: Context) => {
  try {
    const body = ctx.body;

    const { address } = body as { address: string };

    if (!ethers.isAddress(address))
      return error(400, { message: "Invalid address" });

    const existUser = await User.findOne({ address });

    if (existUser) return error(400, { message: "User already exist" });

    const user = new User({
      address,
    });

    await user.save();

    return {
      message: "User created",
      user,
    };
  } catch (err) {
    return error(500, { message: `Internal server error ${err}` });
  }
};

export const getProfile = async (ctx: Context) => {
  try {
    const body = ctx.body;
    const { address } = body as { address: string };

    const user = await User.findOne({ address }).select(
      "-address -__v -_id -createdAt -updatedAt"
    );

    if (!user) return error(404, { message: "User not found" });

    return {
      user,
    };
  } catch (err) {
    return error(500, { message: `Internal server error ${err}` });
    1;
  }
};

export const claimFirstCoin = async (ctx: Context) => {
  try {
    const body = ctx.body;
    const { address } = body as { address: string };

    if (!ethers.isAddress(address))
      return error(400, { message: "Invalid address" });

    const user = await User.findOne({ address });

    if (!user) return error(404, { message: "User not found" });

    if (user.isClaimedFirstCoin)
      return error(400, { message: "User already claimed first coin" });

    return {
      message: "User claimed first coin",
    };
  } catch (err) {
    return error(500, { message: `Internal server error ${err}` });
  }
};
