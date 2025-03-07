import { cors } from "@elysiajs/cors";
import { randomUUIDv7 } from "bun";
import { Elysia, error, t } from "elysia";
import { ethers } from "ethers";
import db from "./db/db";
import { User } from "./models/user.model";
import { type Bullet, type Player } from "./types/types";
db();

// @ts-ignore
import islandErc20Abi from "./abi/islandErc20Abi.json";

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
//@ts-ignore
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contract = new ethers.Contract(
  //@ts-ignore
  process.env.CONTRACT_ADDRESS,
  islandErc20Abi,
  wallet
);

const players: Record<string, Player> = {};
const bullets: Record<string, Bullet> = {};

const BULLET_LIFETIME = 8000;

const forbiddenAreas = [
  { minX: 15, maxX: 25, minZ: 15, maxZ: 25 },

  { minX: -45, maxX: -35, minZ: 15, maxZ: 25 },
  { minX: 73, maxX: 83, minZ: 15, maxZ: 25 },

];

// Generar posición de spawn válida
function generateSafeSpawnPosition() {
  const AREA_SIZE = 500; // 100 unidades en cada eje
  const HALF_AREA = AREA_SIZE / 2;

  let position: { x: number; z: number };
  let isValid = false;

  do {
    position = {
      x: Math.random() * AREA_SIZE - HALF_AREA,
      z: Math.random() * AREA_SIZE - HALF_AREA,
    };

    isValid = !forbiddenAreas.some(
      (area) =>
        position.x >= area.minX &&
        position.x <= area.maxX &&
        position.z >= area.minZ &&
        position.z <= area.maxZ
    );
  } while (!isValid);

  return {
    x: position.x,
    y: 0,
    z: position.z,
  };
}

const app = new Elysia({ prefix: "/v2" })

  .use(
    cors({
      //@ts-ignore
      origin: [process.env.ALLOWED_ORIGIN_1, process.env.ALLOWED_ORIGIN_2],
      allowedHeaders: ["Content-Type"],
      methods: ["GET", "POST"],
    })
  )

  .get("/", () => "Hello Elysia")

  .post(
    "/createUser",
    async ({ body }) => {
      try {
        const address = body.address;

        if (!ethers.isAddress(address))
          return error(400, { message: "Invalid address" });

        const existUser = await User.findOne({ address: address });

        if (existUser) return error(400, { message: "User already exists" });

        const user = new User({ address: address })
        await user.save();

        return {
          message: "User created successfully",
          user,
        };
      } catch (err) {
        return error(500, { message: `Internal server error: ${err}` });
      }
    },
    {
      body: t.Object({
        address: t.String(),
      }),
    }
  )

  .post(
    "/getProfile",
    async ({ body }) => {
      try {
        const address = body.address;
        const user = await User.findOne({ address: address })
          .select("-address")
          .select("-__v")
          .select("-_id")
          .select("-createdAt")
          .select("-updatedAt");

        if (!user) return error(400, { message: "User not found" });
        return {
          user,
        };
      } catch (err) {
        return error(500, { message: `Internal server error: ${err}` });
      }
    },
    {
      body: t.Object({
        address: t.String(),
      }),
    }
  )

  .post(
    "/claimFirstCoin",
    async ({ body }) => {
      try {
        const address = body.address;

        if (!ethers.isAddress(address))
          return error(400, { message: "Invalid address" });

        const user = await User.findOne({ address: address });

        if (!user) return error(400, { message: "User not found" });

        if (user.isClaimedFirstCoin)
          return error(400, { message: "User already claimed first coin" });

        const tx = await contract.transfer(address, ethers.parseEther("1"));
        await tx.wait();

        user.isClaimedFirstCoin = true;
        await user.save();

        return {
          message: "First coin claimed successfully",
        };
      } catch (err) {
        return error(500, { message: `Internal server error: ${err}` });
      }
    },
    {
      body: t.Object({
        address: t.String(),
      }),
    }
  )

  .ws("/ws", {
    // // validate incoming message
    // body: t.Object(),
    // query: t.Object({
    //   id: t.String(),
    // }),

    open(ws) {
      ws.subscribe("main");

      players[ws.id] = {
        id: ws.id,
        position: generateSafeSpawnPosition(),
        rotation: {
          x: 0,
          y: 0,
          z: 0,
          w: 0,
        },
      };

      ws.send(JSON.stringify({ type: "playerId", id: ws.id }));
      ws.send(JSON.stringify({ type: "currentPlayers", players }));

      ws.publish(
        "main",
        JSON.stringify({
          type: "newPlayer",
          player: players[ws.id],
        })
      );

      console.log("Player connected:", ws.id);
    },

    message(ws, { message }) {
      switch (ws.body.type) {
        case "playerMovement": {
          players[ws.id].position = ws.body.position;
          players[ws.id].rotation = ws.body.rotation;

          ws.publish(
            "main",
            JSON.stringify({ type: "playerMovement", player: players[ws.id] })
          );
          break;
        }

        case "bulletShot": {
          const bullet: Bullet = {
            id: randomUUIDv7(),
            owner: ws.id,
            position: ws.body.position,
            velocity: ws.body.velocity,
          };

          ws.publish("main", JSON.stringify({ type: "newBullet", bullet }));

          setTimeout(() => {
            delete bullets[bullet.id];
            ws.publish(
              "main",
              JSON.stringify({ type: "removeBullet", id: bullet.id })
            );
          }, BULLET_LIFETIME);

          break;
        }

        case "removeBullet": {
          delete bullets[ws.body.id];
          ws.publish(
            "main",
            JSON.stringify({ type: "removeBullet", id: ws.body.id })
          );
          break;
        }
      }
    },

    close(ws) {
      delete players[ws.id];

      ws.publish("main", JSON.stringify({ type: "currentPlayers", players }));

      ws.publish(
        "main",
        JSON.stringify({
          type: "playerDisconnected",
          id: ws.id,
        })
      );

      console.log("Player disconnected", ws.id);
    },
  })
  .listen(4000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
