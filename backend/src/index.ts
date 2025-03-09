import { cors } from "@elysiajs/cors";
import { Elysia } from "elysia";
import db from "./db/db";
import { userRoutes } from "./routes/user.routes";
import { type Bullet, type Player, Coin } from "./types/types";
// import webSockets } from "./websockets/websockets";

import { randomUUIDv7, serve, type ServerWebSocket } from "bun";

db();

// @ts-ignore
import islandErc20Abi from "./abi/islandErc20Abi.json";

// const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
// //@ts-ignore
// const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
// const contract = new ethers.Contract(
//   //@ts-ignore
//   process.env.CONTRACT_ADDRESS,
//   islandErc20Abi,
//   wallet
// );

const players: Record<string, Player> = {};
const bullets: Record<string, Bullet> = {};
const coins: Record<string, Coin> = {};

const BULLET_LIFETIME = 8000;
const COIN_LIFETIME = 20000;
const COIN_SPAWN_INTERVAL = 60000;
const COINS_PER_SPAWN = 10;
const COIN_COLLECTION_DISTANCE = 2;

interface CustomServerWebSocket extends ServerWebSocket {
  id: string;
}

function generarPosicionAleatoria(
  target: { x: number; y: number; z: number },
  radioMax: number,
  radioMin: number
) {
  let posicionValida = false;
  let x: number = 0,
    z: number = 0;

  while (!posicionValida) {
    const angulo = Math.random() * 2 * Math.PI;

    const radio = radioMin + Math.random() * (radioMax - radioMin);

    x = target.x + radio * Math.cos(angulo);
    z = target.z + radio * Math.sin(angulo);

    const distancia = Math.sqrt(
      Math.pow(x - target.x, 2) + Math.pow(z - target.z, 2)
    );

    posicionValida = distancia >= radioMin && distancia <= radioMax;
  }

  return {
    x: Number(x.toFixed(2)),
    y: target.y,
    z: Number(z.toFixed(2)),
  };
}

const target = { x: 10, y: 0, z: 10 };
const config = {
  radioMax: 50,
  radioMin: 40,
};

const spawnCoins = (server: any) => {
  for (let i = 0; i < COINS_PER_SPAWN; i++) {
    const coin: Coin = {
      id: randomUUIDv7(),
      position: generarPosicionAleatoria(
        target,
        config.radioMax,
        config.radioMin
      ),
      createdAt: Date.now(),
    };

    coins[coin.id] = coin;

    server.publish(
      "main",
      JSON.stringify({
        type: "newCoin",
        coin,
      })
    );

    setTimeout(() => {
      if (coins[coin.id]) {
        delete coins[coin.id];
        server.publish(
          "main",
          JSON.stringify({
            type: "removeCoin",
            id: coin.id,
          })
        );
      }
    }, COIN_LIFETIME);
  }
};

const app = new Elysia()
  .use(
    cors({
      //@ts-ignore
      origin: [process.env.ALLOWED_ORIGIN_1, process.env.ALLOWED_ORIGIN_2],
      allowedHeaders: ["Content-Type"],
      methods: ["GET", "POST"],
    })
  )
  .group("/v2", (app) => app.use(userRoutes));

const server = serve({
  fetch(req) {
    const url = new URL(req.url);

    if (url.pathname === "/v2/ws") {
      if (server.upgrade(req)) {
        return;
      }
      return new Response("Not Found", { status: 404 });
    }

    return app.handle(req);
  },

  websocket: {
    open(ws: CustomServerWebSocket) {
      ws.id = randomUUIDv7();
      ws.subscribe("main");

      players[ws.id] = {
        id: randomUUIDv7(),
        position: generarPosicionAleatoria(
          target,
          config.radioMax,
          config.radioMin
        ),
        rotation: {
          x: 0,
          y: 0,
          z: 0,
          w: 0,
        },
        coins: 0,
      };

      ws.send(JSON.stringify({ type: "playerId", id: ws.id }));
      ws.send(JSON.stringify({ type: "currentPlayers", players }));
      ws.send(JSON.stringify({ type: "currentCoins", coins }));

      ws.publish(
        "main",
        JSON.stringify({ type: "newPlayer", player: players[ws.id] })
      );

      if (Object.keys(players).length === 1) {
        // setTimeout(() => spawnCoins(server), 20000);

        const coinInterval = setInterval(() => {
          if (Object.keys(players).length > 0) {
            spawnCoins(server);
          } else {
            clearInterval(coinInterval);
          }
        }, COIN_SPAWN_INTERVAL);
      }

      console.log("Player connected:", ws.id);
    },
    message(ws: CustomServerWebSocket, message: any) {
      const body = JSON.parse(message);

      switch (body.type) {
        case "playerMovement": {
          players[ws.id].position = body.position;
          players[ws.id].rotation = body.rotation;

          ws.publish(
            "main",
            JSON.stringify({ type: "playerMovement", player: players[ws.id] })
          );

          Object.entries(coins).forEach(([coinId, coin]) => {
            const dx = players[ws.id].position.x - coin.position.x;
            const dz = players[ws.id].position.z - coin.position.z;
            const distance = Math.sqrt(dx * dx + dz * dz);

            if (distance <= COIN_COLLECTION_DISTANCE) {
              delete coins[coinId];

              players[ws.id].coins += 1;

              server.publish(
                "main",
                JSON.stringify({
                  type: "coinCollected",
                  coinId,
                  playerId: ws.id,
                })
              );

              server.publish(
                "main",
                JSON.stringify({ type: "removeCoin", id: coinId })
              );

              server.publish(
                "main",
                JSON.stringify({ type: "currentCoins", coins })
              );
            }
          });

          break;
        }

        case "bulletShot": {
          const bullet: Bullet = {
            id: randomUUIDv7(),
            position: body.position,
            velocity: body.velocity,
            owner: ws.id,
          };

          ws.publish("main", JSON.stringify({ type: "newBullet", bullet }));

          setTimeout(() => {
            ws.publish(
              "main",
              JSON.stringify({ type: "bulletRemoved", id: bullet.id })
            );
          }, BULLET_LIFETIME);

          break;
        }

        case "removeBullet": {
          delete bullets[body.id];
          ws.publish(
            "main",
            JSON.stringify({ type: "bulletRemoved", id: body.id })
          );
          break;
        }
      }
    },
    close(ws: CustomServerWebSocket, code, message) {
      delete players[ws.id];

      server.publish(
        "main",
        JSON.stringify({ type: "playerDisconnected", id: ws.id })
      );

      if (Object.keys(players).length === 0) {
        Object.keys(coins).forEach((coinId) => {
          delete coins[coinId];
        });
      }
      console.log("Player disconnected", ws.id);
    },
    drain(ws) {},
  },
  port: 4000,
});

console.log(`🦊 Elysia is running at ${server.hostname}:${server.port}`);
