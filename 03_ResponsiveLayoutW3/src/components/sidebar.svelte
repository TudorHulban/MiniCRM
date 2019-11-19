<script>
  import { onMount } from "svelte";

  function w3_close() {
    document.getElementById("mySidebar").style.display = "none";
    document.getElementById("myOverlay").style.display = "none";
  }
  function openNav(id) {
    document.getElementById("nav01").style.display = "none";
    document.getElementById("nav02").style.display = "none";
    document.getElementById(id).style.display = "block";
  }
  onMount(function() {
    openNav("nav01");
  });
</script>

<div
  class="w3-sidebar w3-collapse w3-white w3-large"
  style="z-index:3;width:250px;"
  id="mySidebar">

  <div class="w3-bar w3-black w3-center">
    <a
      class="w3-bar-item w3-button"
      style="width:50%"
      href="javascript:void(0)"
      on:click={() => openNav('nav01')}>
      <i class="fa fa-bars w3-xlarge" />
    </a>
    <a
      class="w3-bar-item w3-button"
      style="width:50%"
      href="javascript:void(0)"
      on:click={() => openNav('nav02')}>
      <i class="fa fa-wrench w3-xlarge" />
    </a>
  </div>

  <div id="nav01" class="w3-bar-block">
    <a
      class="w3-button w3-hover-teal w3-hide-large w3-large w3-right"
      href="javascript:void(0)"
      on:click={w3_close}>
      x
    </a>
    <a class="w3-bar-item w3-button" href="#">Option 1</a>
    <a class="w3-bar-item w3-button" href="#">Option 2</a>
  </div>

  <div id="nav02" class="w3-bar-block">
    <a
      class="w3-button w3-hover-teal w3-hide-large w3-large w3-right"
      href="javascript:void(0)"
      on:click={w3_close}>
      x
    </a>
    <a class="w3-bar-item w3-button" href="#">Option 3</a>
    <a class="w3-bar-item w3-button" href="#">Option 4</a>
  </div>
</div>

<div
  class="w3-overlay w3-hide-large"
  on:click={w3_close}
  style="cursor:pointer"
  id="myOverlay" />
