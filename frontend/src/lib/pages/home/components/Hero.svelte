<script lang="ts">
  import { T } from "@threlte/core";
  import { Text3DGeometry, Suspense } from "@threlte/extras";
</script>

<!-- <T.Mesh>
    <Text3DGeometry font={"incognito.json"} text={"Hello World"} />
    <T.MeshStandardMaterial />
  </T.Mesh> -->

<T.Mesh position={[-7, 1.5, 0]} rotation={[0, 0.3, 0]}>
  <Text3DGeometry
    size={1}
    height={0.1}
    font="Dead Island_Regular.json"
    text={"Island \n Club"}
    depth={.2}
  />

  <T.MeshStandardMaterial
    color="cyan"
    toneMapped={false}
    metalness={0.001}
    roughness={100}
  />
</T.Mesh>

<!-- {#snippet fallback()}
      <Fallback />
    {/snippet} -->
