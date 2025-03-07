<script lang="ts">
  import { T } from "@threlte/core";
  import { AutoColliders } from "@threlte/rapier";
</script>

<T.Group position={[0, -0.7, 0]}>
  <AutoColliders shape={"cuboid"}>
    <T.Mesh receiveShadow>
      <T.BoxGeometry args={[10000, 0.2, 10000]} />
      <T.MeshStandardMaterial />
    </T.Mesh>
  </AutoColliders>
</T.Group>
