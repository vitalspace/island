export interface Player {
  id: string;
  position: {
    x: number;
    y: number;
    z: number;
  };
  rotation: {
    x: number;
    y: number;
    z: number;
    w: number;
  };
  coins: number;
}

export interface Bullet {
  id: string;
  owner: string;
  position: {
    x: number;
    y: number;
    z: number;
  };
  velocity: {
    x: number;
    y: number;
    z: number;
  };
}

export type Coin = {
  id: string;
  position: {
    x: number;
    y: number;
    z: number;
  };
  createdAt: number; // Timestamp cuando se creó la moneda
};
