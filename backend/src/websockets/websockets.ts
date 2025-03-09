import { randomUUIDv7 } from "bun";
import { Elysia } from "elysia";
import { type Bullet, type Player } from "../types/types";

// Añade la definición de tipo para las monedas
type Coin = {
  id: string;
  position: {
    x: number;
    y: number;
    z: number;
  };
  createdAt: number; // Timestamp cuando se creó la moneda
};

const players: Record<string, Player> = {};
const bullets: Record<string, Bullet> = {};
// Añadimos el registro de monedas
const coins: Record<string, Coin> = {};

const BULLET_LIFETIME = 8000;
const COIN_LIFETIME = 20000; // 20 segundos de vida para las monedas
const COIN_SPAWN_INTERVAL = 60000; // 2 minutos entre generaciones de monedas
const COINS_PER_SPAWN = 5; // Número de monedas a generar en cada intervalo
const COIN_COLLECTION_DISTANCE = 2; // Distancia para recolectar monedas

const forbiddenAreas = [
  { minX: 15, maxX: 25, minZ: 15, maxZ: 25 },
  { minX: -45, maxX: -35, minZ: 15, maxZ: 25 },
  { minX: 73, maxX: 83, minZ: 15, maxZ: 25 },
];

function generateSafeSpawnPosition() {
  const AREA_SIZE = 50; // 500 unidades en cada eje
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
    y: 0, // Las monedas aparecen a nivel del suelo
    z: position.z,
  };
}

// Función para generar monedas
function spawnCoins(ws: any) {
  for (let i = 0; i < COINS_PER_SPAWN; i++) {
    const coin: Coin = {
      id: randomUUIDv7(),
      position: generateSafeSpawnPosition(),
      createdAt: Date.now(),
    };

    coins[coin.id] = coin;

    // Notificar a todos los clientes sobre la nueva moneda
    ws.publish(
      "main",
      JSON.stringify({
        type: "newCoin",
        coin,
      })
    );

    console.log("here");

    // Configurar el temporizador para eliminar la moneda después de su tiempo de vida
    setTimeout(() => {
      if (coins[coin.id]) {
        delete coins[coin.id];
        ws.publish(
          "main",
          JSON.stringify({
            type: "removeCoin",
            id: coin.id,
          })
        );
      }
    }, COIN_LIFETIME);
  }
}

const createCoin = async (
  ws: any,
  position: { x: number; y: number; z: number }
) => {
  const coin: Coin = {
    id: randomUUIDv7(),
    position,
    createdAt: Date.now(),
  };

  coins[coin.id] = coin;

  ws.publish(
    "main",
    JSON.stringify({
      type: "newCoin",
      coin,
    })
  );
};

// Función para verificar colisiones entre jugadores y monedas
function checkCoinCollisions(ws: any) {
  Object.values(players).forEach((player) => {
    Object.entries(coins).forEach(([coinId, coin]) => {
      const dx = player.position.x - coin.position.x;
      const dz = player.position.z - coin.position.z;
      const distance = Math.sqrt(dx * dx + dz * dz);

      if (distance <= COIN_COLLECTION_DISTANCE) {
        // Jugador colisionó con una moneda
        delete coins[coinId];

        // Notificar a todos los clientes que se recogió la moneda
        ws.publish(
          "main",
          JSON.stringify({
            type: "coinCollected",
            coinId,
            playerId: player.id,
          })
        );
      }
    });
  });
}

export const webSockets = new Elysia().ws("/ws", {
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
      coins: 0, // Añadimos un contador de monedas al jugador
    };

    ws.send(JSON.stringify({ type: "playerId", id: ws.id }));
    ws.send(JSON.stringify({ type: "currentPlayers", players }));
    ws.send(JSON.stringify({ type: "currentCoins", coins })); // Enviamos monedas actuales

    ws.publish(
      "main",
      JSON.stringify({
        type: "newPlayer",
        player: players[ws.id],
      })
    );

    if (Object.keys(players).length >= 1) {
      //   console.log("hay mas de un jugador", Object.keys(players).length);

      setTimeout(() => {
        for (let i = 0; i < 4; i++) {
          const coin: Coin = {
            id: randomUUIDv7(),
            position: { x: i, y: 0, z: 2 },
            createdAt: Date.now(),
          };

        //   ws.send(JSON.stringify({ type: "newCoin", coin }));
          webSockets.publish(JSON.stringify({ type: "newCoin", coin }));


          console.log("me cumpli", coin);
        }
      }, 20000);
    }

    // Si este es el primer jugador, iniciamos la generación de monedas
    // if (Object.keys(players).length === 1) {
    // Generar monedas iniciales
    //   spawnCoins(ws);

    //   console.log("players", Object.keys(players).length);

    // Configurar generación periódica de monedas
    //   const coinInterval = setInterval(() => {
    //     if (Object.keys(players).length > 0) {
    //       spawnCoins(ws);
    //       console.log("me cumplo");
    //     } else {
    //       clearInterval(coinInterval);
    //     }
    //   }, COIN_SPAWN_INTERVAL);

    // Configurar verificación periódica de colisiones
    //   const collisionInterval = setInterval(() => {
    //     if (Object.keys(players).length > 0) {
    //       checkCoinCollisions(ws);
    //     } else {
    //       clearInterval(collisionInterval);
    //     }
    //   }, 100); // Verificar colisiones cada 100ms
    // }

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

        if (coins.length > 0) {
          //   checkCoinCollisions(ws);
          for (let i = 0; i < coins.length; i++) {
            const coin = coins[i];
            const dx = players[ws.id].position.x - coin.position.x;
            const dz = players[ws.id].position.z - coin.position.z;
            const distance = Math.sqrt(dx * dx + dz * dz);

            if (distance <= COIN_COLLECTION_DISTANCE) {
              // Jugador colisionó con una moneda
              delete coins[i];

              // Incrementar contador de monedas del jugador
         


              // Notificar a todos los clientes que se recogió la moneda
              ws.publish(
                "main",
                JSON.stringify({
                  type: "coinCollected",
                  coinId: coin.id,
                  playerId: ws.id,
                  playerCoins: players[ws.id].coins,
                })
              );
            }
          }
        }

        // Verificar colisiones con monedas después de cada movimiento
        // Object.entries(coins).forEach(([coinId, coin]) => {
        //   const dx = players[ws.id].position.x - coin.position.x;
        //   const dz = players[ws.id].position.z - coin.position.z;
        //   const distance = Math.sqrt(dx * dx + dz * dz);

        //   console.log("distance", distance, COIN_COLLECTION_DISTANCE)

        //   if (distance <= COIN_COLLECTION_DISTANCE) {
        //     // Jugador colisionó con una moneda
        //     delete coins[coinId];

        //     // Incrementar contador de monedas del jugador
        //     players[ws.id].coins += 1;

        //     // Notificar a todos los clientes que se recogió la moneda
        //     ws.publish("main", JSON.stringify({
        //       type: "coinCollected",
        //       coinId,
        //       playerId: ws.id,
        //       playerCoins: players[ws.id].coins
        //     }));
        //   }
        // });

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

    // Si no hay más jugadores, limpiamos todas las monedas
    if (Object.keys(players).length === 0) {
      Object.keys(coins).forEach((coinId) => {
        delete coins[coinId];
      });
    }

    console.log("Player disconnected", ws.id);
  },
});
