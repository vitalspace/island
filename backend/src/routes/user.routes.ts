import { Elysia, t } from "elysia";
import { ethers } from "ethers";

import {
  createUser,
  getProfile,
  claimFirstCoin,
} from "../controllers/user.controller";

export const userRoutes = new Elysia()
  .get("/", () => "Hello World")
  .post("/createUser", createUser, {
    body: t.Object({
      address: t.String({
        validate: (address: string) => ethers.isAddress(address),
      }),
    }),
  })
  .post("/getProfile", getProfile, {
    body: t.Object({
      address: t.String(),
    }),
  })
  .post("/claimFirstCoin", claimFirstCoin, {
    body: t.Object({
      address: t.String(),
    }),
  });
