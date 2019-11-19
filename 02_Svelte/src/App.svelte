<script>
  import { Router } from "svelte-router-spa";
  import { routes } from "./routes/routes";
</script>

<svelte:head />
<Router {routes} />
