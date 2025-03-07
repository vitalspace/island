<script lang="ts">
  import { Router, Link, Route } from "svelte5-router";
  import Home from "./routes/Home.svelte";
  import Play from "./routes/Play.svelte";
  import Market from "./routes/Market.svelte";
  import Whitepaper from "./routes/WhitePaper.svelte";
  import Menu from "./lib/components/Menu.svelte";
  import { isConnected } from "./lib/stores/stores";

  import webApp from "./lib/App/App";
  let url = $state("");

  // const initApp = async () => {
  //   const isConn = await webApp.isConnected();
  //   isConnected.set(isConn);
  // };

  // $effect(() => {
  //   initApp();
  // });
</script>

<Router {url}>
  <Menu />

  <div>
    <Route path="/" component={Home} />
    <Route path="/play" component={Play} />
    <Route path="/market" component={Market} />
    <Route path="/whitepaper" component={Whitepaper} />
  </div>
</Router>
