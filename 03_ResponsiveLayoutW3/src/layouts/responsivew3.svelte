<script>
  import Footer from "../components/footer.svelte";
  import Main from "../components/main.svelte";
  import Sidebar from "../components/sidebar.svelte";
</script>

<Sidebar />

<div class="w3-main w3-sand" style="margin-left:250px;">

  <div class="w3-top w3-theme w3-large w3-hide-large">
    <i class="fa fa-bars w3-button w3-teal w3-xlarge" onclick="w3_open()" />
  </div>

  <Main />
  <Footer />
</div>
