<script lang="ts">
  import { T } from "@threlte/core";
  import { FakeGlowMaterial, Sky, Text3DGeometry } from "@threlte/extras";
  import Player from "./components/player/player.svelte";
  import Ground from "./components/world/Ground.svelte";
  import Island from "./components/world/Island.svelte";
  import Water from "./components/world/Water.svelte";
</script>

<T.PerspectiveCamera
  position={[0, 15, 60]}
  makeDefault
  oncreate={(ref) => {
    ref.lookAt(20, 1, 0);
  }}
/>

<T.DirectionalLight position={[10, 0, 10]} castShadow />

<T.Mesh position={[-2.5, 15, 45]}>
  <Text3DGeometry
    size={1}
    height={0.1}
    font="Dead Island_Regular.json"
    text={"ISLAND \n CLUB"}
    depth={0.2}
  />
  <FakeGlowMaterial glowColor="red" />
</T.Mesh>

<Sky elevation={0.5} azimuth={130} />
<Water />
<Island />
<Ground />
<Player />
