<template>
    <div class="navbar-container" >
        <div class="navbar1 shadow p-3">
            <div class="navbar-inner">
                <div id="home-section" class="navbar-sections">
                    <router-link
                        class="navbar-sections-router-link-text"
                        :class="{ 'home-active-navbar-sections-router-link-text': $route.path === '/' }"
                        to="/"
                        >
                        <div>
                            <svg width="24" height="22" viewBox="0 0 24 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M0.0104078 14.9469C0.0104078 13.0955 0.0342754 11.2441 0.000643761 9.39479C-0.0188843 8.27065 0.405308 7.43361 1.34916 6.77812C4.45412 4.62589 7.53738 2.44304 10.6326 0.273912C11.1544 -0.0923588 11.5395 -0.0902477 12.0635 0.273912C15.2321 2.49898 18.4 4.72511 21.5672 6.95229C21.9136 7.18178 22.1961 7.49128 22.3894 7.85307C22.5827 8.21486 22.6808 8.61764 22.6749 9.02536C22.6821 13.0202 22.6821 17.0154 22.6749 21.011C22.6749 21.5926 22.2279 21.9968 21.59 21.9979C19.6784 21.9979 17.7668 21.9979 15.8552 21.9979C15.3746 21.9979 14.8951 21.9979 14.4145 21.9979C13.7538 21.9979 13.3589 21.6105 13.3578 20.9698C13.3578 19.5184 13.3578 18.0681 13.3578 16.6168C13.363 16.2008 13.2323 15.7939 12.9845 15.4549C12.7366 15.1159 12.3845 14.8622 11.9789 14.7305C11.0524 14.4434 10.1118 14.7305 9.57155 15.4588C9.31657 15.8083 9.18418 16.2284 9.19401 16.6569C9.19401 18.084 9.19401 19.5103 9.19401 20.936C9.19401 21.6232 8.80778 21.9989 8.09718 22C5.76467 22 3.43288 22 1.10181 22C0.38578 22 0.0169171 21.6358 0.0169171 20.9297C0.0118543 18.9347 0.00968452 16.9405 0.0104078 14.9469ZM1.88076 20.119H7.35403V19.8108C7.35403 18.8102 7.35403 17.8053 7.35403 16.8078C7.34979 16.5492 7.36794 16.2908 7.40828 16.0352C7.75978 14.1173 9.29707 12.8443 11.3019 12.801C13.3361 12.7567 15.1533 14.3537 15.2509 16.3297C15.3095 17.5034 15.2737 18.6814 15.2824 19.8573C15.2824 19.9628 15.2943 20.0684 15.2998 20.1602H20.7546V19.9649C20.7546 16.3599 20.7546 12.756 20.7546 9.15308C20.7546 8.80897 20.5886 8.57253 20.3152 8.38042C18.7834 7.29745 17.2508 6.21552 15.7175 5.13465C14.3172 4.14949 12.9155 3.16186 11.5124 2.17176C11.4748 2.14593 11.4317 2.12856 11.3863 2.12089C11.3409 2.11323 11.2943 2.11546 11.2499 2.12743C11.0601 2.22414 10.8787 2.33569 10.7074 2.46098C7.90913 4.41724 5.11373 6.3742 2.32122 8.33187C2.17828 8.42311 2.06214 8.54889 1.98417 8.69692C1.9062 8.84494 1.86907 9.01012 1.87642 9.1763C1.88438 12.6462 1.88438 16.1164 1.87642 19.587L1.88076 20.119Z" fill="#D3D5DF"/>
                            </svg>
                        </div>
                        <div>Home</div>
                    </router-link>
                </div>
                <div id="transaction-section" class="navbar-sections">
                    <router-link
                        class="navbar-sections-router-link-text"
                        :class="{ 'active-navbar-sections-router-link-text': $route.path === '/transactions' }"
                        to="/transactions"
                    >
                        <div>
                            <svg width="24" height="22" viewBox="0 0 24 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6 1H19" stroke="#D3D5DF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M6 7H19" stroke="#D3D5DF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M6 13H19" stroke="#D3D5DF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M1 1H1.01" stroke="#D3D5DF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M1 7H1.01" stroke="#D3D5DF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M1 13H1.01" stroke="#D3D5DF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </div>
                        <div>Transactions</div>
                    </router-link>
                </div>
                <div id="stats-section" class="navbar-sections">
                    <router-link
                        class="navbar-sections-router-link-text"
                        :class="{ 'active-navbar-sections-router-link-text': $route.path === '/dashboard' }"
                        to="/dashboard"
                    >
                        <div>
                            <svg width="24" height="22" viewBox="0 0 24 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M23 1L13.5 10.5L8.5 5.5L1 13" stroke="#D3D5DF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M17 1H23V7" stroke="#D3D5DF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </div>
                        <div>Dashboard</div>
                    </router-link>
                </div>
            </div>
        </div>
    </div>
</template>


<script>
export default {
    name: 'NavBar',
};
</script>

<style scoped>
.navbar-container {
    align-items: center;
    display:flex;
    justify-content:center;
    transition: top 0.3s; 
    padding-left: 32px;
    padding-right: 32px;
}

.navbar1 {
    overflow: hidden;
    background-color: white;
    position: fixed;
    bottom: 32px;
    height: 65px;
    width: 320px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 30px;
}


.navbar1 .navbar-sections  {
    text-align: center;
    display: inline-block;
    text-decoration: none;
    font-size: 12px;
    padding-left: 23px;
    padding-right: 23px;
}

.navbar-sections {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.navbar-sections-router-link-text {
    padding-top: 5px;
    color: #7c7c7c;
    text-decoration: none;
}

.navbar-item-image {
    width: 22.68px;
    padding-top: 11px;
}

.active-navbar-sections-router-link-text {
    padding-top: 5px;
    color: #5350F6;
    text-decoration: none;
}

.active-navbar-sections-router-link-text svg path {
    padding-top: 5px;
    color: #5350F6;
    text-decoration: none;
    stroke: #5350F6;
}

.home-active-navbar-sections-router-link-text {
    padding-top: 5px;
    color: #5350F6;
    text-decoration: none;
}

.home-active-navbar-sections-router-link-text svg path {
    padding-top: 5px;
    color: #5350F6;
    text-decoration: none;
    fill: #5350F6;
}


</style>