<script>
  import Footer from "../components/footer.svelte";
  import Main from "../components/main.svelte";
  import Sidebar from "../components/sidebar.svelte";

  function w3_open() {
    document.getElementById("mySidebar").style.display = "block";
    document.getElementById("myOverlay").style.display = "block";
  }
</script>

<Sidebar />

<div class="w3-main w3-theme-l5" style="margin-left:250px;">
  <div class="w3-top w3-theme w3-large w3-hide-large">
    <i class="fa fa-bars w3-button w3-xlarge" on:click={w3_open} />
  </div>

  <Main />
  <Footer />
</div>
