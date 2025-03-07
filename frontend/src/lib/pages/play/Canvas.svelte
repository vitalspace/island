<script lang="ts">
  import Scene from "./Scene.svelte";
  import { Canvas } from "@threlte/core";
  import { Tween } from "svelte/motion";
  import { fade } from "svelte/transition";
  import { fromStore } from "svelte/store";
  import { useProgress } from "@threlte/extras";

  import { World, Debug } from "@threlte/rapier";

  let showCanvas = $state(false);

  const { progress } = useProgress();
  const p = fromStore(progress);

  const tweenedProgress = Tween.of(() => p.current, {
    duration: 150,
  });

  const progressWidth = $derived(100 * tweenedProgress.current);
  const progressLessThanOne = $derived(tweenedProgress.current < 1);

  $effect(() => {
    if (tweenedProgress.current === 1) {
      showCanvas = true;
    }
  });

  let debug = true;
</script>

{#if progressLessThanOne && !showCanvas}
  <div
    transition:fade|local={{
      duration: 200,
    }}
    class="absolute top-0 left-0 w-full h-full bg-white flex flex-col items-center justify-center"
  >
    <div class="grid gap-y-4 text-center">
      <div>
        <h1 class="font-doctor-terror text-9xl">Loading</h1>
      </div>

      <div class="w-full grid gap-4">
        <p class="font-doctor-terror text-xl">Loading</p>
        <div class="w-full border h-3">
          <div
            class="h-full bg-black w-full"
            style="width: {tweenedProgress.current * 100}%"
          ></div>
        </div>
      </div>
    </div>
  </div>
{/if}

<div class="h-screen" class:hidden={!showCanvas}>
  <Canvas>
    <World>
      {#if debug}
      <Debug />
    {/if}
      <Scene />
    </World>
  </Canvas>
</div>

<!-- {#if progressLessThanOne  && showCanvas}
  <div
    transition:fade={{
      duration: 200,
    }}
    class="wrapper"
  >
    <p class="loading">Loading</p>
    <div class="bar-wrapper">
      <div class="bar" style="width: {progressWidth}%"></div>
    </div>
  </div>
{/if}

<div class="main fixed top-0 left-0 w-full h-screen z-0" class:main={showCanvas}>
  <Canvas>
    <Scene />
  </Canvas>
</div> -->
