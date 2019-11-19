<script>
  import { user } from "../state/user.js";
  import { navigateTo } from "svelte-router-spa";
  import { urls } from "../routes/urls.js";

  let usercode = "admin";
  let password = "xxx";

  async function fetchToken(pURL, pBody) {
    const resp = await fetch(pURL, {
      method: "POST",
      body: pBody
    });
    return await resp.json();
  }

  function handleSubmit() {
    const bodyFormData = new FormData();
    bodyFormData.set("logincode", usercode);
    bodyFormData.set("password", password);

    fetchToken(urls.Login, bodyFormData).then(function(r) {
      if (r.token == undefined) {
        user.updateIsLogged(false);
        return;
      }
      user.updateLoggedUserState(true, r.token, r.id);
      navigateTo("admin");
    });
  }
</script>

<style>
  .alata {
    font-family: "Alata", sans-serif;
  }
</style>

<div class="w3-container w3-half w3-margin-top" style="height:200px;">
  <div class="w3-container w3-display-middle w3-card-4 alata">
    <h5 class="w3-center ">Login Page</h5>

    <form on:submit|preventDefault={handleSubmit} class="w3-container ">
      <label>User CODE</label>
      <input
        type="text"
        name="logincode"
        bind:value={usercode}
        style="width:90%"
        class="w3-input w3-margin-bottom" />

      <label>Password</label>
      <input
        type="password"
        name="password"
        bind:value={password}
        style="width:90%"
        class="w3-input" />

      <p>
        <button type="submit" class="w3-button w3-blue">Login</button>
      </p>
    </form>
  </div>

</div>
