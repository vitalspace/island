<script lang="ts">
  import { Copy, CopyCheck, Store, Wallet } from "lucide-svelte";
  import { navigate } from "svelte5-router";
  import webApp from "../../App/App";
  import { ERC20_ADDRESS, TOKEN_INFO } from "../../constants/constants";
  import { createUser, getProfile } from "../../services/user.services";
  import {
    balance,
    isClaimedFirstCoin,
    isConnected,
  } from "../../stores/stores";
  import Canvas from "./Canvas.svelte";

  let isLoading = $state();
  let isCopied = $state(false);

  const getBalance = async () => {
    try {
      const balance = await webApp.getTokenBalance(
        TOKEN_INFO.address,
        TOKEN_INFO.abi
      );
      return balance;
    } catch (error) {
      console.error("Error getting token balance:", error);
    }
  };

  const connectWallet = async () => {
    isLoading = true;

    try {
      await webApp.connectWallet();
      const isConn = await webApp.isConnected();
      isConnected.set(isConn);
      isLoading = false;

      if (isConn) {
        const address = await webApp.getAddress();
        try {
          const { data } = await getProfile(address!);
          const isClaimed = data?.user.isClaimedFirstCoin;
          isClaimedFirstCoin.set(isClaimed);
          balance.set(Number(await getBalance()));
        } catch (error) {
          const result = await createUser(address!);
          if (result) {
            const { data } = await getProfile(address!);
            const isClaimed = data?.user.isClaimedFirstCoin;
            isClaimedFirstCoin.set(isClaimed);
            balance.set(Number(await getBalance()));
          }
        }
      }
    } catch (error) {
      console.error("Error connecting wallet", error);
      isLoading = false;
    }
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(ERC20_ADDRESS);
    isCopied = true;
  };
</script>

<main class="w-full h-screen font-sans absolute justify-center items-center">
  <section
    class="mx-auto text-center absolute z-10 bottom-20 left-0 right-0 flex justify-center"
  >
    <div class=" rounded-3xl p-4 grid gap-6">
      <div class="flex items-center gap-2 text-white w-md">
        <!-- <ScrollText class="h-6 w-6 text-white" />
        <span class="border border-white/30 rounded-full ">Contract Addresss</span> -->

        <div
          class="bg-black/30 backdrop-blur-md rounded-full px-4 py-2 flex items-center justify-between gap-2 border border-white/10 mb-2 w-full"
        >
          <div class="w-full flex justify-between place-items-center">
            <span class="text-white/70 text-sm">Contract Address:</span>
            <span class="text-white/90 text-sm font-mono"
              >{ERC20_ADDRESS.slice(0, 13)}...{ERC20_ADDRESS.slice(-13)}</span
            >
          </div>
          <button
            onclick={copyAddress}
            class="ml-2 p-2 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Copiar dirección del contrato"
          >
            {#if isCopied}
              <CopyCheck class="h-4 w-4 text-blue-400" />
            {:else}
              <Copy class="h-4 w-4 text-white/70" />
            {/if}
          </button>
        </div>
      </div>

      <div class="flex gap-4 w-md">
        <button
          onclick={$isConnected ? () => navigate("/play") : connectWallet}
          class="w-full bg-white/20 backdrop-blur-md hover:bg-white/30 text-white border border-white/30 rounded-full px-8 flex items-center justify-center py-2 transition-colors cursor-pointer"
        >
          {#if isLoading && !$isConnected}
            <div
              class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"
            ></div>
          {:else if $isConnected}
            <span>Play</span>
          {:else}
            <Wallet class="mr-2 h-4 w-4" />
            Connect Wallet
          {/if}
        </button>

        <button
          onclick={() => navigate("/market")}
          class="w-full bg-white/20 backdrop-blur-md hover:bg-white/30 text-white border border-white/30 rounded-full px-8 flex items-center justify-center py-2 transition-colors cursor-pointer"
        >
          <Store class="mr-2 h-4 w-4" />
          Market</button
        >
      </div>
    </div>
  </section>

  <Canvas />
</main>
