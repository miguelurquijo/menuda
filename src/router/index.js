// TUTORIAL ON HOW TO USE ROUTER IN VUE 3 IN THE VIDEO BELOW
// https://www.youtube.com/watch?v=juocv4AtrHo&list=PL4cUxeGkcC9hYYGbV60Vq3IXYNfDk8At1&index=8&ab_channel=TheNetNinja

import { createRouter, createWebHistory } from "vue-router";
import HelloWorld from "../components/HelloWorld.vue";
import Transactions from "../views/Transactions.vue";

const routes = [
    {
        path: "/",
        name: "Home",
        component: HelloWorld
    },
    {
        path: "/transactions",
        name: "Transactions",
        component: Transactions
    },
];

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes
});

export default router;