<script lang="ts">
  import { T } from "@threlte/core";
  import { Sky } from "@threlte/extras";
  import Water from "./componets/world/Water.svelte";
  import Ground from "./componets/world/Ground.svelte";
  import { WebsocketService } from "./websockets/WebsocketServices";
  import { WS } from "../../constants/constants";
  import { type Player, type Bullet, type Coin } from "./types/types";
  import Island from "./componets/world/Island.svelte";

  import Player3d from "./componets/player/player.svelte";
  import RemotePlayer3D from "./componets/player/remotePlayer.svelte";
  import RemoteBullet from "./componets/player/remoteBullet.svelte";
  import IslandCoin from "./componets/world/islandCoin.svelte";
  // import Boat from './componets/player/boat.svelte';

  let playerId = $state("");
  let player = $state<Player>();
  let players = $state<Player[]>([]);
  let bullets = $state<Bullet[]>([]);
  let coins = $state<Coin[]>([]);

  const websockets = new WebsocketService(WS);
  let websocketStatus = $state<"connecting" | "open" | "closed" | "error">(
    "closed"
  );
  websockets.status.subscribe((status) => (websocketStatus = status));

  websockets.messages.subscribe((message) => {
    if (!message?.type) return;

    // console.log("message", message.type);

    switch (message.type) {
      case "playerId": {
        playerId = message.id;
        break;
      }

      case "currentPlayers": {
        Object.keys(message.players).forEach((_id) => {
          const { id, position, rotation } = message.players[_id];

          if (_id === playerId) {
            player = {
              id,
              position,
              rotation,
            };
          } else {
            players?.push({
              id,
              position,
              rotation,
            });
          }
        });

        break;
      }

      case "newPlayer": {
        players?.push(message.player);
        break;
      }

      case "playerDisconnected": {
        if (typeof message.id !== "string") return;
        players = players?.filter((player) => player.id !== message.id);
        break;
      }

      case "playerMovement": {
        players?.forEach((player) => {
          if (player.id === message.player.id) {
            player.position = message.player.position;
            player.rotation = message.player.rotation;
          }
        });
        break;
      }

      case "newBullet": {
        bullets = [
          ...bullets,
          {
            ...message.bullet,
          },
        ];
        break;
      }

      case "bulletRemoved": {
        bullets = bullets?.filter((bullet) => bullet.id !== message.id);
        break;
      }

      case "currentCoins": {
        if (
          !message.coins ||
          !Array.isArray(message.coins) ||
          message.coins.length === 0
        )
          return;

        coins.push(...message.coins);

        break;
      }

      case "coinCollected": {
        console.log("coinCollected", message);
        break;
      }

      case "newCoin": {
        coins.push(message.coin);
        // console.log(" newCoin", message.coin);
        break;
      }

      case "removeCoin": {
        // console.log("removeCoin", message.id);
        // if (coins.length === 0 && message.id) return;
        coins = coins?.filter((coin) => coin.id !== message.id);
        // console.log("removeCoin", message.id);
        break;
      }
    }
  });
</script>

<T.PerspectiveCamera
  makeDefault
  position={[0, 2, 10]}
  oncreate={(ref) => {
    ref.lookAt(0, 1, 0);
  }}
/>

<T.DirectionalLight position={[0, 10, 10]} castShadow />

<Sky elevation={0.5} azimuth={130} />
<Water />
<Ground />
<Island />

{#if websocketStatus && player}
  {#if players?.length > 0}
    {#each players as player (player.id)}
      <RemotePlayer3D {player} />
    {/each}
  {/if}

  {#each bullets as bullet (bullet.id)}
    <RemoteBullet bulletInfo={bullet} />
  {/each}

  <Player3d {player} socket={websockets} />
  {#if coins?.length > 0}
    {#each coins as coin}
      <IslandCoin coinInfo={coin} />
    {/each}
  {/if}
{/if}

<!-- <IslandCoin
  coinInfo={{ id: 1, position: { x: 0, y: 4, z: 0 }, createdAt: 0 }}
/> -->

<!-- <RemotePlayer3D player={{id: 1, position: { x: 0, y: 1, z: 2 }, rotation: { x: 0, y: 0, z: 0, w: 0 }}} /> -->

<!-- <Boat />  -->
