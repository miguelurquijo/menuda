<template>
  <div class="navbar-container" >
      <div class="navbar1 shadow p-3">
          <div class="navbar-inner">
              <div id="home-section" class="navbar-sections">
                  <a href="/" >
                      <div><img id="home-image" src="/images/home.svg" alt="home" class="navbar-item-image" href="/home"></div>
                      <p id="home-text" class="footer-text">Home</p>
                  </a>
              </div>
              <div id="transaction-section" class="navbar-sections">
                  <a href="/transactions">
                      <div><img id="transactions_image" src="/images/transactions_gray.svg" alt="home" class="navbar-item-image" href="/transactions"></div>
                      <p class="footer-text">Transactions</p>
                  </a>
              </div>
              <div id="stats-section" class="navbar-sections">
                  <a href="/dashboard">
                      <div><img id="dashboard_image" src="/images/Stats.svg" alt="home" class="navbar-item-image" href="/dashboard"></div>
                      <p class="footer-text">Stats</p>
                  </a>
              </div>
          </div>
      </div>
  </div>
</template>

<script>
export default {
  name: 'NavBar',
  props: {
    msg: String
  },
}
</script>

<style scoped>
.navbar-container {
    align-items: center;
    display:flex;
    justify-content:center;
    transition: top 0.3s; 

}

.navbar1 {
    overflow: hidden;
    background-color: white;
    position: fixed;
    bottom: 24px;
    height: 65px;
    width: 320px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding-left: 32px;
    padding-right: 32px;
    border-radius: 30px;
}

.navbar1 .navbar-sections  {
    color: black;
    text-align: center;
    display: inline-block;
    text-decoration: none;
    font-size: 12px;
    padding-left: 16px;
    padding-right: 16px;
}

.navbar-sections {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.navbar-sections a p {
    padding-top: 5px;
    color: #7c7c7c;
    
}

.active-navbar-sections  {
    color: black;
    text-align: center;
    display: inline-block;
    text-decoration: none;
    font-size: 12px;
    padding-left: 16px;
    padding-right: 16px;
}

.active-navbar-sections a p {
    padding-top: 5px;
    color: #7c7c7c;
    
}

.active-navbar-sections a p {
    color: #5350F6;
}

.navbar-item-image {
    width: 22.68px;
    padding-top: 11px;
}
</style>