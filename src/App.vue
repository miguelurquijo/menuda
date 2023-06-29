<template>
  <HelloWorld />
  <NavBar />
</template>

<script>
  import HelloWorld from './components/HelloWorld.vue'
  import NavBar from './components/NavBar.vue'

  export default {
    name: 'App',
    components: {
      HelloWorld,
      NavBar
    }
  }
</script>

<style>
body {
  font-family: 'DM Sans', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
  background-color: #fafafa !important;

}

@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,700;1,400;1,500;1,700&display=swap');
</style>
