<template>
    <!-- HEADER -->
    <header class="header">
        <div class="text-section">
            <span class="text">Transactions</span>
        </div>
        <div class="logo-section">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 1V19" stroke="#5350F6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M1 10H19" stroke="#5350F6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        </div>
        <div class="logo-section">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 17C13.4183 17 17 13.4183 17 9C17 4.58172 13.4183 1 9 1C4.58172 1 1 4.58172 1 9C1 13.4183 4.58172 17 9 17Z" stroke="#5350F6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M19 19L14.65 14.65" stroke="#5350F6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        </div>
    </header>

    <!-- LIST OF TRANSACTIONS -->
    <p class="date-grouper">Today</p>
    <div class="card">
        <div class="column image-column">
            <svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="19" cy="19" r="18.5" fill="white" stroke="#5350F6"/>
            </svg>
        </div>
        <div class="column text-column">
            <div class="row">
                <h2>Pergamino</h2>
            </div>
            <div class="row">
                <p>Fun</p>
            </div>
        </div>
            <div class="column bold-text-column">
                <strong>$36,000</strong>
        </div>
    </div>

    <div class="card">
        <div class="column image-column">
            <svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="19" cy="19" r="18.5" fill="white" stroke="#5350F6"/>
            </svg>
        </div>
        <div class="column text-column">
            <div class="row">
                <h2>EPM</h2>
            </div>
            <div class="row">
                <p>Utilities</p>
            </div>
        </div>
            <div class="column bold-text-column">
                <strong>$366,000</strong>
        </div>
    </div>

    <p class="date-grouper">May 2</p>
    <div class="card">
        <div class="column image-column">
            <svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="19" cy="19" r="18.5" fill="white" stroke="#5350F6"/>
            </svg>
        </div>
        <div class="column text-column">
            <div class="row">
                <h2>Cheff Burger</h2>
            </div>
            <div class="row">
                <p>Restaurant</p>
            </div>
        </div>
            <div class="column bold-text-column">
                <strong>$62,000</strong>
        </div>
    </div>

    <div class="card">
        <div class="column image-column">
            <svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="19" cy="19" r="18.5" fill="white" stroke="#5350F6"/>
            </svg>
        </div>
        <div class="column text-column">
            <div class="row">
                <h2>Gasolina</h2>
            </div>
            <div class="row">
                <p>Transport</p>
            </div>
        </div>
            <div class="column bold-text-column">
                <strong>$144,000</strong>
        </div>
    </div>
    <div class="card">
        <div class="column image-column">
            <svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="19" cy="19" r="18.5" fill="white" stroke="#5350F6"/>
            </svg>
        </div>
        <div class="column text-column">
            <div class="row">
                <h2>Cine</h2>
            </div>
            <div class="row">
                <p>Entretaiment</p>
            </div>
        </div>
            <div class="column bold-text-column">
                <strong>$94,000</strong>
        </div>
    </div>
    
    <NavBar />
</template>


<script>

import NavBar from '../components/NavBar.vue'

export default {
    name: 'App',
    components: {
    NavBar
    }
}
</script>

<style>
.date-grouper {
    display: flex;
    width: 150px;
    height: 21px;
    flex-direction: column;
    justify-content: flex-end;
    flex-shrink: 0;
    color: #878787;
    font-family: DM Sans;
    font-size: 18px;
    font-style: normal;
    font-weight: 400;
    line-height: 20px; /* 142.857% */
    margin-bottom: 20px;
    text-align: left;
    margin-left: 32px;
    margin-top: 32px;

}
.card {
    display: flex;
    background-color: #fafafa; /* Adjust the background color as needed */
    align-items: center; /* Vertically align sections in the center */
    border-bottom: 1px solid #EBEBEB; /* Add a border line below the card */
    margin-left: 32px;
    margin-right: 32px;
    margin-bottom: 10px;

}

.column {
    flex: 1;
    padding: 10px;
    display: flex;
    flex-direction: column;
    text-align: left;
}

.image-column {
    flex: 10%;
    align-items: flex-start;
}

img {
    max-width: 100%;
    height: auto;
}

.text-column {
    flex: 60%;
}

.row {
    margin: 0;
}



h2 {
    margin: 0;
    color: var(--Body, #404040);
    font-feature-settings: 'clig' off, 'liga' off;
    font-family: DM Sans;
    font-size: 18px;
    font-style: normal;
    font-weight: 400;
    line-height: 20px; /* 142.857% */
}

p {
    margin: 0;
    color: var(--Light-Gray, #D3D5DF);
    font-feature-settings: 'clig' off, 'liga' off;
    font-family: DM Sans;
    font-size: 18px;
    font-style: normal;
    font-weight: 400;
    line-height: 20px; /* 142.857% */
}

.bold-text-column {
    flex: 20%;
    align-items: flex-end;
    display: flex;
    justify-content: flex-end;
}

strong {
    color: #4C4C4C;
    text-align: right;
    font-family: DM Sans;
    font-size: 18px;
    font-style: normal;
    font-weight: 700;
    line-height: 20px; /* 142.857% */
}

.header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: #fafafa; /* Adjust the background color as needed */
    color: var(--Ttitles, #1F1F1F);
    font-feature-settings: 'clig' off, 'liga' off;
    font-family: DM Sans;
    font-size: 24px;
    font-style: normal;
    font-weight: 700;
    line-height: 36px; /* 150% */
    margin-left: 32px;
    margin-right: 32px;
    margin-bottom: 32px;
}

.text-section {
    flex: 70%;
    text-align: left;
}

.text {
    font-family: DM Sans;
    font-size: 24px;
    font-style: normal;
    font-weight: 700;
    line-height: 36px; /* 150% */
}

.logo-section {
    flex: 15%;
    display: flex;
    justify-content: flex-end;
}

.logo {
    max-width: 100%;
    height: auto;
    /* Add any additional styling for your logos as needed */
}
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

