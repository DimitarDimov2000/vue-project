<script setup lang="ts">
import { ref } from 'vue';

const header = ref('KPI Dashboard App')
const items = ref([
  {id: 1, label: "5 Martinis"},
  {id: 2, label: "2 Aperol Spritz"},
  {id: 3, label: "20 Beers"}
])
</script>

<template>
  <h1>{{ header }}</h1>
  <p>
    Visit <a href="https://vuejs.org/" target="_blank" rel="noopener">vuejs.org</a> to read the
    documentation
  </p>

  <ul>
    <li v-for="item in items" :key="item.id">{{item.label}}</li>
  </ul>
</template>

<style scoped></style>
