<script lang="ts">
  import { T, useThrelte, useTask } from "@threlte/core";
  import { RigidBody, AutoColliders } from "@threlte/rapier";
  import type { Euler, Mesh } from "three";
  import { SphereGeometry, MeshBasicMaterial, Vector3 } from "three";
  import type { RigidBody as RapierRigidBody } from "@dimforge/rapier3d-compat";

  let { bulletInfo } = $props<{
    bulletInfo: {
      id: string;
      position: { x: number; y: number; z: number };
      velocity: { x: number; y: number; z: number };
      ownerId: string;
    };
  }>();

  let body: RapierRigidBody | undefined = $state(undefined);

  const geometry = new SphereGeometry(0.2);
  const material = new MeshBasicMaterial({ color: "yellow" });

  $effect(() => {
    //   const throwBullet = () => {

    // body?.setTranslation();

    // body?.setTranslation(
    //   {
    //     x: bulletInfo.position.x,
    //     y: bulletInfo.position.y,
    //     z: bulletInfo.position.z,
    //   },
    //   true
    // );
    body?.setLinvel(
      {
        x: bulletInfo.velocity.x,
        y: bulletInfo.velocity.y,
        z: bulletInfo.velocity.z,
      },
      true
    );
    //   };
  });
  //   throwBullet();
</script>

<T.Group
  position={[
    bulletInfo.position.x,
    bulletInfo.position.y,
    bulletInfo.position.z,
  ]}
>
  <RigidBody type="dynamic" bind:rigidBody={body}>
    <AutoColliders shape="ball">
      <T.Mesh castShadow receiveShadow {geometry} {material} />
    </AutoColliders>
  </RigidBody>
</T.Group>
