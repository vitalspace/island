import { writable } from "svelte/store";

export const isConnected = writable(false);
export const isClaimedFirstCoin = writable(false);
export const balance = writable(0);