<script setup lang="ts">
import { ref } from "vue"
import DrinksView from "./views/DrinksView.vue"
import StockView from "./views/StockView.vue"
import SalesView from "./views/SalesView.vue"

type Tab = "drinks" | "stock" | "sales"
const tab = ref<Tab>("drinks")
</script>

<template>
  <div class="topbar">
    <strong>Bar Ops Core</strong>

    <nav class="tabs">
      <button :class="{ active: tab === 'drinks' }" @click="tab = 'drinks'">Drinks</button>
      <button :class="{ active: tab === 'stock' }" @click="tab = 'stock'">Stock</button>
      <button :class="{ active: tab === 'sales' }" @click="tab = 'sales'">Sales</button>
    </nav>
  </div>

  <DrinksView v-if="tab === 'drinks'" />
  <StockView v-else-if="tab === 'stock'" />
  <SalesView v-else />
</template>

<style scoped>
.topbar {
  max-width: 900px;
  margin: 0 auto;
  padding: 16px;
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: space-between;
}
.tabs { display: flex; gap: 8px; }
button {
  padding: 8px 10px;
  border: 1px solid #aaa;
  border-radius: 6px;
  background: white;
  cursor: pointer;
}
button.active { background: #f0f0f0; }
</style>
