<script lang="ts">
  import { Dices, FileText, Import, Store } from "lucide-svelte";
  import webApp from "../App/App";
  import { isConnected } from "../stores/stores";
  import { TOKEN_INFO } from "../constants/constants";
  import { getProfile, createUser } from "../services/user.services";
  import { isClaimedFirstCoin, balance } from "../stores/stores";
  import { ConvexObjectBreaker } from "three/examples/jsm/Addons.js";

  let isLoading = $state(true);

  const checkInitialConnection = async () => {
    try {
      const isConn = await webApp.isConnected();
      isConnected.set(isConn);
      isLoading = false;

      if (isConn) {
        const address = await webApp.getAddress();
        try {
          const { data } = await getProfile(address!);
          const isClaimed = data?.user.isClaimedFirstCoin;
          isClaimedFirstCoin.set(isClaimed);
        } catch (error) {
          console.error("Error checking initial connection", error);
          const result = await createUser(address!);
          if (result) {
            const { data } = await getProfile(address!);
            const isClaimed = data?.user.isClaimedFirstCoin;
            isClaimedFirstCoin.set(isClaimed);
          }
        }
      }
    } catch (error) {
      console.error("Erro checking initial connection", error);
      isLoading = false;
    }
  };

  // const addTokenToMetamask = async () => {
  //   try {
  //     await webApp.addTokenToMetamask(
  //       TOKEN_INFO.name,
  //       TOKEN_INFO.address,
  //       TOKEN_INFO.symbol,
  //       TOKEN_INFO.image,
  //       TOKEN_INFO.decimals
  //     );
  //   } catch (error) {
  //     console.error("Error adding token to Metamask:", error);
  //   }
  // };

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

  const init = async () => {
    balance.set(Number(await getBalance()));
  };

  $effect(() => {
    checkInitialConnection();
    init();
  });
</script>

<div class="absolute z-10 w-full text-white py-10">
  <div class="container mx-auto px-20 flex justify-between items-center">
    <div>
      <a href="/" title="Island Club">
        <!-- <h1 class="text-3xl">Island Club</h1> -->
        <img
          class="w-14 h-14 border border-transparent hover:border-white rounded-full transition-colors"
          src="island.png"
          alt=""
        />
      </a>
    </div>
    <div class="flex gap-4">
      <a class="flex items-center gap-2" href="/play">
        <Dices class=" h-5 w-5" /> Play</a
      >
      <a class="flex items-center gap-2" href="/market">
        <Store class=" h-5 w-5" />
        Market</a
      >
      <a class="flex items-center gap-2" href="/whitepaper">
        <FileText class=" h-5 w-5" />

        White paper</a
      >

      {#if isLoading && !$isConnected}
        <div
          class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"
        ></div>
      {:else if $isConnected}
        <span>{$balance} {TOKEN_INFO.symbol}</span>
      {:else}
        <button
          onclick={connectWallet}
          class="flex items-center gap-2 bg-white/20 backdrop-blur-md hover:bg-white/30 text-white border border-white/30 px-8 py-2 rounded-md cursor-pointer"
        >
          <span>Connect Wallet</span>
        </button>
      {/if}

      <!-- <button
        onclick={addTokenToMetamask}
        class="flex items-center gap-2 bg-white/20 backdrop-blur-md hover:bg-white/30 text-white border border-white/30 px-8 py-2 rounded-md cursor-pointer"
      >
        Add Token
      </button> -->
    </div>
  </div>
</div>
