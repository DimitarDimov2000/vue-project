<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Drink {
  id: number
  name: string
  price: number
}

const header = ref('KPI Dashboard App')
const items = ref<Drink[]>([])

function loadThings() {
  const endpoint = 'https://kpi-dashboard-wfqf.onrender.com/drinks'

  fetch(endpoint)
    .then(res => res.json())
    .then((data: Drink[]) => {
      items.value = data
    })
    .catch(err => console.error(err))
}

onMounted(() => {
  loadThings()
})
</script>

<template>
  <h1>{{ header }}</h1>

  <ul>
    <li v-for="item in items" :key="item.id">
      {{ item.name }} – {{ item.price }} €
    </li>
  </ul>
</template>
