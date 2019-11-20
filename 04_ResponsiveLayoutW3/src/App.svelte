<script>
  import Layout from "./layouts/responsivew3.svelte";

  import { Router } from "svelte-router-spa";
  import { routes } from "./routes/routes";
</script>

<svelte:head>
  <link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css" />
  <link
    rel="stylesheet"
    href="https://www.w3schools.com/lib/w3-theme-indigo.css" />
  <link
    rel="stylesheet"
    href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css" />
</svelte:head>

<!-- <Layout /> -->
<Router {routes} />
