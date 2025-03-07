<script lang="ts">
  import { Canvas } from "@threlte/core";
  import Scene from "./Scene.svelte";
  import { World, Debug } from "@threlte/rapier";

  let debug = false;
</script>

<div class="fixed top-0 left-0 w-full h-screen z-0">
  <Canvas>
    <World>
      {#if debug}
        <Debug />
      {/if}
      <Scene />
    </World>
  </Canvas>
</div>
