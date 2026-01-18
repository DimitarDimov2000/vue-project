<script setup lang="ts">
import { computed, onMounted, ref } from "vue"
import { apiGet, apiPost } from "../api"

interface Drink {
  id: number
  name: string
  price: number
  category: string
  active: boolean
}

interface Sale {
  id: number
  drink: Drink
  quantity: number
  timestamp: string
  unitPriceSnapshot: number
}

const drinks = ref<Drink[]>([])
const sales = ref<Sale[]>([])
const errorMsg = ref<string | null>(null)

const drinkId = ref<number | null>(null)
const quantity = ref<number>(1)

const revenue = computed(() =>
  sales.value.reduce((sum, s) => sum + s.unitPriceSnapshot * s.quantity, 0)
)

async function load() {
  try {
    errorMsg.value = null
    drinks.value = await apiGet<Drink[]>("/api/drinks")
    sales.value = await apiGet<Sale[]>("/api/sales")
  } catch (e: any) {
    errorMsg.value = e?.message ?? "Failed to load data"
  }
}

async function recordSale() {
  if (drinkId.value === null) {
    errorMsg.value = "Select a drink"
    return
  }
  if (quantity.value < 1) {
    errorMsg.value = "Quantity must be >= 1"
    return
  }

  try {
    errorMsg.value = null
    await apiPost<Sale>("/api/sales", {
      drinkId: drinkId.value,
      quantity: quantity.value,
    })
    quantity.value = 1
    await load()
  } catch (e: any) {
    errorMsg.value = e?.message ?? "Failed to record sale"
  }
}

onMounted(load)
</script>

<template>
  <div class="container">
    <header class="header">
      <h1>Sales</h1>
      <p class="muted">Total revenue (loaded): {{ revenue.toFixed(2) }} €</p>
    </header>

    <p v-if="errorMsg" class="error">{{ errorMsg }}</p>

    <section class="card">
      <h2>Record sale</h2>

      <form class="form" @submit.prevent="recordSale">
        <label>
          Drink
          <select v-model.number="drinkId">
            <option :value="null">Select…</option>
            <option v-for="d in drinks" :key="d.id" :value="d.id">
              {{ d.name }} ({{ d.category }})
            </option>
          </select>
        </label>

        <label>
          Quantity
          <input type="number" v-model.number="quantity" min="1" />
        </label>

        <div class="actions">
          <button type="submit">Record</button>
        </div>
      </form>
    </section>

    <section class="card">
      <h2>History</h2>

      <table class="table">
        <thead>
        <tr>
          <th>Time</th>
          <th>Drink</th>
          <th class="right">Qty</th>
          <th class="right">Unit</th>
          <th class="right">Total</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="s in sales" :key="s.id">
          <td>{{ new Date(s.timestamp).toLocaleString() }}</td>
          <td>{{ s.drink.name }}</td>
          <td class="right">{{ s.quantity }}</td>
          <td class="right">{{ s.unitPriceSnapshot.toFixed(2) }} €</td>
          <td class="right">{{ (s.unitPriceSnapshot * s.quantity).toFixed(2) }} €</td>
        </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<style scoped>
.container { max-width: 900px; margin: 0 auto; padding: 16px; }
.header { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; }
.card { border: 1px solid #ddd; border-radius: 8px; padding: 16px; margin-top: 16px; }
.form { display: grid; grid-template-columns: 2fr 1fr; gap: 12px; align-items: end; }
select, input { width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 6px; }
.actions { display: flex; justify-content: flex-end; }
.table { width: 100%; border-collapse: collapse; margin-top: 8px; }
.table th, .table td { border-bottom: 1px solid #eee; padding: 10px; }
.right { text-align: right; }
button { padding: 8px 10px; border: 1px solid #aaa; border-radius: 6px; background: white; cursor: pointer; }
.error { color: #d33; margin-top: 12px; }
.muted { color: #666; }
</style>
