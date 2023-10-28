<template>  
    <header class="header">
        <div class="header-icon left">
            <router-link to="/transactions">
                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="20" viewBox="0 0 11 20" fill="none">
                    <path d="M10 1L1 10L10 19" stroke="#5350F6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </router-link>
        </div>
        <div class="header-icon right">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="20" viewBox="0 0 24 20" fill="none">
                <path d="M23 17C23 17.5304 22.7893 18.0391 22.4142 18.4142C22.0391 18.7893 21.5304 19 21 19H3C2.46957 19 1.96086 18.7893 1.58579 18.4142C1.21071 18.0391 1 17.5304 1 17V6C1 5.46957 1.21071 4.96086 1.58579 4.58579C1.96086 4.21071 2.46957 4 3 4H7L9 1H15L17 4H21C21.5304 4 22.0391 4.21071 22.4142 4.58579C22.7893 4.96086 23 5.46957 23 6V17Z" stroke="#5350F6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M12 15C14.2091 15 16 13.2091 16 11C16 8.79086 14.2091 7 12 7C9.79086 7 8 8.79086 8 11C8 13.2091 9.79086 15 12 15Z" stroke="#5350F6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        </div>
    </header>

    <div>
        <form @submit.prevent="submitForm">
            <div class="form-group">
                <label for="title">Title</label>
                <input type="text" id="title" v-model="formData.title" required>
            </div>

            <div class="form-group">
                <label>Category</label>
                <div class="category-buttons">
                    <button
                        v-for="category in categories"
                        :key="category"
                        @click="selectCategory(category)"
                        :class="{ 'selected': formData.category === category }"
                    >{{ category }}</button>
                </div>
            </div>

            <div class="form-group">
                <label for="value">Value</label>
                <input type="number" id="value" inputmode="numeric" v-model="formData.value" required>
            </div>

            <div class="form-group">
                <label for="date">Date</label>
                <input type="date" id="date" v-model="formData.date" required>
            </div>

            <div class="form-group">
                <label for="user">User</label>
                <select id="user" v-model="formData.user" required>
                    <option value="miguelurquijo25@gmail.com">Miguel Urquijo</option>
                    <option value="valenhenao23@gmail.com">Valentina Henao</option>
                </select>
            </div>
            
            <button type="submit">Submit</button>
        </form>
    </div>

    <!-- FLOATING CATEGORY ICON.  -->
    <!-- <div class="container">
        <svg xmlns="http://www.w3.org/2000/svg" width="62" height="62" viewBox="0 0 62 62" fill="none">
            <circle cx="31" cy="31" r="30" fill="white" stroke="#5350F6" stroke-width="2"/>
        </svg>
        <h3 style="text-align: center;">Rent</h3>
    </div> -->



</template>
    
<script>
export default {  
    name: 'AddTransaction',
    data() {
        return {
            formData: {
                title: '',
                category: 'Arriendo',
                value: null,
                date: new Date().toISOString().substr(0, 10),
                user: '',
            },
            categories: [
                'Arriendo',
                'Mercado',
                'Restaurantes',
                'Mascotas',
                'Servicios Publicos',
                'Entretenimiento',
                'Transporte',
                'Gimnasio',
                'Suscripciones',
                'Aseo apartamento',
                'Otros',
            ],
        };
    },
    methods: {
        submitForm() {
      // You can handle form submission here, e.g., send the data to a server.
        console.log("hola");
        },
        selectCategory(category) {
            this.formData.category = category;
            console.log(this.category);
    },
    }
}
</script>

<style scoped>
.header {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.header-icon {
    display: flex;
    align-items: center;
}
.container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding-top: 42px;
}

.container h3 {
    color: var(--Body, #404040);
    font-feature-settings: 'clig' off, 'liga' off;
    font-family: DM Sans;
    font-size: 14px;
    font-style: normal;
    font-weight: 400;
    line-height: 20px; /* 142.857% */
}

.currency-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.svg-icon {
  cursor: pointer;
}

.left-icon {
  margin-right: 32px;
}

.right-icon {
  margin-left: 32px;
}

.currency-input {
  text-align: center;
}

.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 32px;
}

label {
  margin-bottom: 5px;
}

input[type="text"],
input[type="number"],
select,
input[type="date"] {
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-left: 32px;
  margin-right: 32px;
}
</style>