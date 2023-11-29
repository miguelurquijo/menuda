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
                <label class="form-label" for="title">Title</label>
                <input type="text" id="title" v-model="formData.title" required>
            </div>

            <div class="form-group">
                <label class="form-label">Category</label>
                <div class="category-buttons">
                    <button class="buttons-chips"
                        v-for="category in categories"
                        :key="category"
                        @click="selectCategory(category)"
                        :class="{ 'selected': formData.category === category, 'clicked': formData.category === category }"
                    >{{ category }}</button>
                </div>
            </div>

            <div class="form-group">
                <label class="form-label" for="value">Value</label>
                <input type="number" id="value" inputmode="numeric" v-model="formData.value" required>
            </div>

            <div class="form-group">
                <label class="form-label" for="date">Date</label>
                <input class="date-input" type="date" id="date" v-model="formData.date" required>
            </div>

            <div class="form-group">
                <label class="form-label" for="user">User</label>
                <select id="user" v-model="formData.user" required>
                    <option value="miguelurquijo25@gmail.com">Miguel Urquijo</option>
                    <option value="valenhenao23@gmail.com">Valentina Henao</option>
                </select>
            </div>
            
            <button type="submit">Submit</button>
        </form>
    </div>
</template>
    
<script>
export default {  
    name: 'AddTransaction',
    data() {
        return {
            formData: {
                title: '',
                category: 'Restaurantes',
                value: null,
                date: new Date().toISOString().substr(0, 10),
                user: '',
            },
            categories: [
                'Restaurantes',
                'Entretenimiento',
                'Transporte',
                'Mercado',  
                'Mascotas',
                'Otros',
                'Arriendo',
                'Servicios Publicos',
                'Gimnasio',
                'Suscripciones',
                'Aseo apartamento',
            ],
        };
    },
    methods: {
        async submitForm() {
            // API request using fetch
            const apiUrl = 'https://sheltered-tor-40996-f5163a62f67d.herokuapp.com/https://api.notion.com/v1/pages';
            const notionSecret = 'secret_Y1LuHs2RofqlnVplmTN481EBVcL3Eq5UKF2rjMAChFE';
            const requestData = {
                parent: {
                database_id: '4c2dc21032f0457f84a7e7797adbfd3c',
                },
                properties: {
                    Title: {
                        title: [
                        {
                            text: {
                            content: this.formData.title,
                            },
                        },
                        ],
                    },
                    Value: {
                        number: this.formData.value,
                    },
                    Category: {
                        rich_text: [
                        {
                            text: {
                            content: this.formData.category,
                            },
                        },
                        ],
                    },
                    Date: {
                        date: {
                        start: this.formData.date,
                        },
                    },
                    User: {
                        rich_text: [
                            {
                                text: {
                                content: this.formData.user,
                                }
                            }
                        ]
                    }
                },
            };
            try {
                const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${notionSecret}`,
                    'Content-Type': 'application/json',
                    'Notion-Version': '2021-08-16',
                    // Add any other headers as needed
                },
                body: JSON.stringify(requestData),
                });

                const responseData = await response.json();
                console.log('Notion API response:', responseData);

                // Redirect to /transactions
                this.$router.push('/transactions');

                // Handle the response as needed
            } catch (error) {
                console.error('Error submitting data to Notion API:', error);
                // Handle errors
            }
        },

        selectCategory(category) {
            this.formData.category = category;
            console.log(category);
        },
    },
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

.date-input {
    width: 311px;
    height: 54px;
    flex-shrink: 0;
    border-radius: 7px;
    border: 1px solid #E5E5E5;
    background: #FFF;
}

.form-label {
    width: 80px; /* Adjust the width as needed */
    margin-left: 32px;
    margin-bottom: 8px;
    text-align: left;
}

.category-buttons {
    margin-left: 32px;
    margin-right: 32px;


}
.buttons-chips {
    height: 40px;
    color: #2c3e50; 
    transition: background-color 1s; /* Add a transition for a smooth color change */
    border-radius:32px;

}

.buttons-chips.clicked {
    background-color: #5350F6; /* Change this to the desired color */
    color: #fff; /* Change this to the desired text color */
}

</style>