<template>
  <div>
    <h1>MENUDA</h1>
    <p>Is initialized: {{ Vue3GoogleOauth.isInit }}</p>
    <p>Is authorized in: {{ Vue3GoogleOauth.isAuthorized }}</p>
    <h2 v-if='user'>Email:  {{ user }} </h2>
    <h2 v-if='user'>Name: {{ name }}</h2>
    <button :disabled="!Vue3GoogleOauth.isInit || Vue3GoogleOauth.isAuthorized" @click="handleSignIn">Sign in</button>
    <button :disabled="!Vue3GoogleOauth.isAuthorized" @click="handleSignOut" >Sign out</button>
  </div>
  <NavBar />

</template>


<script>
import { inject } from 'vue';
import NavBar from '../components/NavBar.vue';


export default {
  name: 'HelloWorld',
  components: {
        NavBar
    },
  props: {
    msg: String
  },


data() {
    return {
      user: '',
    }
},
  
  methods: {
      async handleSignIn() {
        try {
          const googleUser = await this.$gAuth.signIn();
          if(!googleUser){
            return null;
        }
        this.user = googleUser.getBasicProfile().getEmail();
        this.name = googleUser.getBasicProfile().getName();
      } catch (error) {
          console.log(error);
          return null;
        }    
  },

  async handleSignOut() {
    try {
      await this.$gAuth.signOut();
      this.user = '';
    } catch (error) {
      console.log(error);
      return null;
    }
  }
},

  setup() {
    const Vue3GoogleOauth = inject('Vue3GoogleOauth')
    return { 
      Vue3GoogleOauth 
    };
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
