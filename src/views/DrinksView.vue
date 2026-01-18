<script setup lang="ts">
import { computed, onMounted, ref } from "vue"
import { apiGet, apiPost, apiPut, apiPatch } from "../api"

interface Drink {
  id: number
  name: string
  price: number
  category: string
  active: boolean
}

interface CreateDrinkRequest {
  name: string
  price: number
  category: string
}

const drinks = ref<Drink[]>([])
const errorMsg = ref<string | null>(null)
const loading = ref(false)

const categoryFilter = ref<string>("")

const form = ref<CreateDrinkRequest>({
  name: "",
  price: 0,
  category: "",
})

const editingId = ref<number | null>(null)

const filteredDrinks = computed(() => {
  const c = categoryFilter.value.trim().toLowerCase()
  if (!c) return drinks.value
  return drinks.value.filter(d => d.category.toLowerCase() === c)
})

async function load() {
  try {
    loading.value = true
    errorMsg.value = null
    drinks.value = await apiGet<Drink[]>("/api/drinks")
  } catch (e: any) {
    errorMsg.value = e?.message ?? "Failed to load drinks"
  } finally {
    loading.value = false
  }
}

function startEdit(d: Drink) {
  editingId.value = d.id
  form.value = { name: d.name, price: d.price, category: d.category }
}

function cancelEdit() {
  editingId.value = null
  form.value = { name: "", price: 0, category: "" }
}

async function submit() {
  // simple frontend validation
  if (!form.value.name.trim()) {
    errorMsg.value = "Name is required"
    return
  }
  if (!form.value.category.trim()) {
    errorMsg.value = "Category is required"
    return
  }
  if (form.value.price < 0) {
    errorMsg.value = "Price must be >= 0"
    return
  }

  try {
    errorMsg.value = null
    if (editingId.value === null) {
      await apiPost<Drink>("/api/drinks", form.value)
    } else {
      await apiPut<Drink>(`/api/drinks/${editingId.value}`, form.value)
    }
    cancelEdit()
    await load()
  } catch (e: any) {
    errorMsg.value = e?.message ?? "Request failed"
  }
}

async function deactivate(id: number) {
  try {
    errorMsg.value = null
    await apiPatch<Drink>(`/api/drinks/${id}/deactivate`)
    await load()
  } catch (e: any) {
    errorMsg.value = e?.message ?? "Failed to deactivate"
  }
}

onMounted(load)
</script>

<template>
  <div class="container">
    <header class="header">
      <h1>Drinks</h1>

      <div class="filter">
        <label>
          Category filter:
          <input v-model="categoryFilter" placeholder="e.g. Beer" />
        </label>
      </div>
    </header>

    <p v-if="errorMsg" class="error">{{ errorMsg }}</p>
    <p v-if="loading">Loading…</p>

    <section class="card">
      <h2>{{ editingId === null ? "Add drink" : `Edit drink #${editingId}` }}</h2>

      <form class="form" @submit.prevent="submit">
        <label>
          Name
          <input v-model="form.name" />
        </label>

        <label>
          Price (€)
          <input type="number" step="0.01" v-model.number="form.price" />
        </label>

        <label>
          Category
          <input v-model="form.category" />
        </label>

        <div class="actions">
          <button type="submit">
            {{ editingId === null ? "Create" : "Save" }}
          </button>
          <button v-if="editingId !== null" type="button" class="secondary" @click="cancelEdit">
            Cancel
          </button>
        </div>
      </form>
    </section>

    <section class="card">
      <h2>List</h2>

      <table class="table">
        <thead>
        <tr>
          <th>Name</th>
          <th>Category</th>
          <th class="right">Price</th>
          <th>Status</th>
          <th class="right">Actions</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="d in filteredDrinks" :key="d.id" :class="{ inactive: !d.active }">
          <td>{{ d.name }}</td>
          <td>{{ d.category }}</td>
          <td class="right">{{ d.price.toFixed(2) }} €</td>
          <td>{{ d.active ? "active" : "inactive" }}</td>
          <td class="right">
            <button class="secondary" @click="startEdit(d)">Edit</button>
            <button class="danger" :disabled="!d.active" @click="deactivate(d.id)">Deactivate</button>
          </td>
        </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<style scoped>
.container { max-width: 900px; margin: 0 auto; padding: 16px; }
.header { display: flex; align-items: flex-end; justify-content: space-between; gap: 12px; }
.filter input { margin-left: 8px; }

.card { border: 1px solid #ddd; border-radius: 8px; padding: 16px; margin-top: 16px; }
.form { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
.form input { width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 6px; }
.actions { grid-column: 1 / -1; display: flex; gap: 8px; }

.table { width: 100%; border-collapse: collapse; margin-top: 8px; }
.table th, .table td { border-bottom: 1px solid #eee; padding: 10px; }
.right { text-align: right; }
.inactive { opacity: 0.55; }

button { padding: 8px 10px; border: 1px solid #aaa; border-radius: 6px; background: white; cursor: pointer; }
button.secondary { background: #f6f6f6; }
button.danger { border-color: #d33; color: #d33; }
button:disabled { opacity: 0.5; cursor: not-allowed; }

.error { color: #d33; margin-top: 12px; }
</style>
