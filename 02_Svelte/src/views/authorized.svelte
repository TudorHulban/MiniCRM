<script>
  import { user } from "../state/user.js";
  import { loggedUserData } from "../state/getCurrentUserData.js";
  import { navigateTo } from "svelte-router-spa";

  let data;
  loggedUserData.getLoggedUserData().then(d => (data = d));

  function handleLogout() {
    user.updateLoggedUserState(false, "", -1);
    navigateTo("login");
  }
</script>

<h5>Admin Area</h5>
<h5>Restricted Page</h5>

<h6>{JSON.stringify($user)}</h6>

{#if data != {}}
  <h6>{JSON.stringify(data)}</h6>
{:else}
  <h6>loading ..</h6>
{/if}

<button on:click={handleLogout} class="w3-button w3-blue">Logout</button>
