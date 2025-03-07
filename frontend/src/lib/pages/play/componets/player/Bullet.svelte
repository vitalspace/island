<script lang="ts">
  import { T, useThrelte } from "@threlte/core";
  import { RigidBody, AutoColliders } from "@threlte/rapier";
  import type { Euler, Mesh } from "three";
  import { SphereGeometry, MeshBasicMaterial, Vector3 } from "three";
  import type { RigidBody as RapierRigidBody } from "@dimforge/rapier3d-compat";

  let { socket, canonRef } = $props();

  let body: RapierRigidBody | undefined = $state(undefined);

  const { camera } = useThrelte();

  const geometry = new SphereGeometry(0.2);
  const material = new MeshBasicMaterial({ color: "yellow" });

  const throwBullet = () => {
    if (!canonRef) return;

    const camDirection = new Vector3();
    $camera.getWorldDirection(camDirection);

    const cannonWorldPosition = new Vector3();
    canonRef.getWorldPosition(cannonWorldPosition);

    const cannonDirection = new Vector3();
    canonRef.getWorldDirection(cannonDirection);
    const offsetDistance = 4; // Adjust based on cannon length
    const offsetHeight = 2; // Adjust based on cannon height

    const newBulletPos = cannonWorldPosition.clone();
    newBulletPos.add(cannonDirection.multiplyScalar(offsetDistance));
    newBulletPos.y += offsetHeight;

    camDirection.multiplyScalar(100); // Adjust force as needed

    body?.setTranslation(newBulletPos, true);
    body?.setLinvel(camDirection, true);

    socket.send({
      type: "bulletShot",
      position: newBulletPos,
      velocity: camDirection,
    });
  };

  $effect(() => {
    document.addEventListener("pointerdown", throwBullet);
  });
</script>

<T.Group>
  <RigidBody type="dynamic" bind:rigidBody={body}>
    <AutoColliders shape="ball">
      <T.Mesh castShadow receiveShadow {geometry} {material} />
    </AutoColliders>
  </RigidBody>
</T.Group>
