export type Player = {
  id: string;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number; w: number };
};

export type Bullet = {
  id: string;
  position: { x: number; y: number; z: number };
  velocity: { x: number; y: number; z: number };
  ownerId: string;
};

export type Coin = {
  id: string;
  position: {
    x: number;
    y: number;
    z: number;
  };
  createdAt: number; // Timestamp cuando se creó la moneda
};
