<script>
  import { Route } from "svelte-router-spa";
  import NavBar from "../components/navbar.svelte";
  import Footer from "../components/footer.svelte";

  export let currentRoute;
</script>

<div class="w3-container w3-sand">
  <NavBar />
  <h1>Admin Layout</h1>
  <Route {currentRoute} />
<Footer />
