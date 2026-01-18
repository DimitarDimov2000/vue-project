<script setup lang="ts">
import { computed, onMounted, ref } from "vue"
import { apiGet, apiPut, apiPost } from "../api"

interface Drink {
  id: number
  name: string
  price: number
  category: string
  active: boolean
}

interface StockItem {
  id: number
  drink: Drink
  stockLevel: number
  reorderThreshold: number
}

interface UpdateStockRequest {
  drinkId: number
  stockLevel: number
  reorderThreshold: number
}

const stock = ref<StockItem[]>([])
const errorMsg = ref<string | null>(null)
const loading = ref(false)

const selectedDrinkId = ref<number | null>(null)
const stockLevel = ref<number>(0)
const reorderThreshold = ref<number>(0)

const lowStock = computed(() =>
  stock.value.filter(s => s.stockLevel <= s.reorderThreshold)
)

async function load() {
  try {
    loading.value = true
    errorMsg.value = null
    stock.value = await apiGet<StockItem[]>("/api/stock")
  } catch (e: any) {
    errorMsg.value = e?.message ?? "Failed to load stock"
  } finally {
    loading.value = false
  }
}

function selectRow(s: StockItem) {
  selectedDrinkId.value = s.drink.id
  stockLevel.value = s.stockLevel
  reorderThreshold.value = s.reorderThreshold
}

async function save() {
  if (selectedDrinkId.value === null) {
    errorMsg.value = "Select a drink first"
    return
  }
  try {
    errorMsg.value = null
    const body: UpdateStockRequest = {
      drinkId: selectedDrinkId.value,
      stockLevel: stockLevel.value,
      reorderThreshold: reorderThreshold.value,
    }
    await apiPut<StockItem>("/api/stock", body)
    await load()
  } catch (e: any) {
    errorMsg.value = e?.message ?? "Failed to update stock"
  }
}

async function restock(amount: number) {
  if (selectedDrinkId.value === null) {
    errorMsg.value = "Select a drink first"
    return
  }
  try {
    errorMsg.value = null
    await apiPost<StockItem>(`/api/stock/${selectedDrinkId.value}/restock?amount=${amount}`, {})
    await load()
  } catch (e: any) {
    errorMsg.value = e?.message ?? "Failed to restock"
  }
}

onMounted(load)
</script>

<template>
  <div class="container">
    <header class="header">
      <h1>Stock</h1>
      <p class="muted">Low stock: {{ lowStock.length }}</p>
    </header>

    <p v-if="errorMsg" class="error">{{ errorMsg }}</p>
    <p v-if="loading">Loading…</p>

    <section class="card">
      <h2>Update stock</h2>

      <div class="form">
        <label>
          Stock level
          <input type="number" v-model.number="stockLevel" />
        </label>

        <label>
          Reorder threshold
          <input type="number" v-model.number="reorderThreshold" />
        </label>

        <div class="actions">
          <button @click="save">Save</button>
          <button class="secondary" @click="restock(10)">+10</button>
          <button class="secondary" @click="restock(50)">+50</button>
        </div>

        <p class="muted" v-if="selectedDrinkId === null">
          Select a row from the table to edit.
        </p>
      </div>
    </section>

    <section class="card">
      <h2>Overview</h2>

      <table class="table">
        <thead>
        <tr>
          <th>Drink</th>
          <th>Category</th>
          <th class="right">Stock</th>
          <th class="right">Threshold</th>
        </tr>
        </thead>
        <tbody>
        <tr
          v-for="s in stock"
          :key="s.id"
          :class="{
              low: s.stockLevel <= s.reorderThreshold,
              selected: selectedDrinkId === s.drink.id
            }"
          @click="selectRow(s)"
        >
          <td>{{ s.drink.name }}</td>
          <td>{{ s.drink.category }}</td>
          <td class="right">{{ s.stockLevel }}</td>
          <td class="right">{{ s.reorderThreshold }}</td>
        </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<style scoped>
.container { max-width: 900px; margin: 0 auto; padding: 16px; }
.header { display: flex; justify-content: space-between; align-items: baseline; }
.card { border: 1px solid #ddd; border-radius: 8px; padding: 16px; margin-top: 16px; }
.form { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.form input { width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 6px; }
.actions { grid-column: 1 / -1; display: flex; gap: 8px; align-items: center; }
.table { width: 100%; border-collapse: collapse; margin-top: 8px; }
.table th, .table td { border-bottom: 1px solid #eee; padding: 10px; }
.right { text-align: right; }
.low { background: #fff3f3; }
.selected { outline: 2px solid #999; }
button { padding: 8px 10px; border: 1px solid #aaa; border-radius: 6px; background: white; cursor: pointer; }
button.secondary { background: #f6f6f6; }
.error { color: #d33; margin-top: 12px; }
.muted { color: #666; }
</style>
