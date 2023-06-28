<template>
  <div class="hello">
    <h1>MENUDA</h1>
    <p>Is initialized: {{ Vue3GoogleOauth.isInit }}</p>
    <p>Is authorized in: {{ Vue3GoogleOauth.isAuthorized }}</p>
    <h2 v-if='user'>User email:  {{ user }}</h2>
    <button :disabled="!Vue3GoogleOauth.isInit || Vue3GoogleOauth.isAuthorized" @click="handleSignIn">Sign in</button>
    <button :disabled="!Vue3GoogleOauth.isAuthorized" @click="handleSignOut" >Sign out</button>
  </div>
</template>


<script>
import { inject } from 'vue';

export default {
  name: 'HelloWorld',
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
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
