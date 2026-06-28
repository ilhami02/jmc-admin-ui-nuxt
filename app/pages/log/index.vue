<template>
  <div class="card">
    <div class="card-header">
      <div class="ms-auto">
        <div class="input-group">
          <input type="text" class="form-control" v-model="searchQuery" @keyup.enter="loadLogs" placeholder="Cari Data ..." />
          <button class="btn" type="button" @click="loadLogs">
            <IconSearch stroke="{2}" />
          </button>
        </div>
      </div>
    </div>
    <div class="table-responsive card-body p-0">
      <table class="table table-vcenter">
        <thead>
          <tr>
            <th width="5">No</th>
            <th>Nama User</th>
            <th>Modul</th>
            <th>Aksi</th>
            <th>Timestamp</th>
          </tr>
        </thead>
        <tbody v-if="logs.length > 0">
          <tr v-for="(item, index) in logs" :key="item.id">
            <td class="text-center">{{ (page - 1) * limit + index + 1 }}</td>
            <td>{{ item.user }}</td>
            <td>{{ item.modul }}</td>
            <td>{{ item.aksi }}</td>
            <td>{{ formatDateTimeID(item.timestamp) }}</td>
          </tr>
        </tbody>
        <tbody v-else>
          <tr>
            <td colspan="5" class="text-center">Tidak ada log aktivitas ditemukan</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="card-footer d-flex align-items-center">
      <ul class="pagination ms-auto m-0" v-if="totalPages > 1">
        <!-- Previous Page -->
        <li class="page-item" :class="{ disabled: page === 1 }">
          <a class="page-link" href="#" @click.prevent="changePage(page - 1)" tabindex="-1">
            <!-- Download SVG icon from http://tabler-icons.io/i/chevron-left -->
            <svg xmlns="http://www.w3.org/2000/svg" class="icon" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M15 6l-6 6l6 6" /></svg>
            prev
          </a>
        </li>
        <!-- Page Numbers -->
        <li class="page-item" v-for="p in totalPages" :key="p" :class="{ active: p === page }">
          <a class="page-link" href="#" @click.prevent="changePage(p)">{{ p }}</a>
        </li>
        <!-- Next Page -->
        <li class="page-item" :class="{ disabled: page === totalPages || totalPages === 0 }">
          <a class="page-link" href="#" @click.prevent="changePage(page + 1)">
            next
            <!-- Download SVG icon from http://tabler-icons.io/i/chevron-right -->
            <svg xmlns="http://www.w3.org/2000/svg" class="icon" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><path d="M9 6l6 6l-6 6"></path></svg>
          </a>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  title: "Log Aktifitas",
});

useSeoMeta({
  title: "Log Aktifitas",
});

import { ref, onMounted, watch } from 'vue';
import { IconSearch } from "@tabler/icons-vue";
import { formatDateTimeID } from "~/utils/formatDate.js";

const tokenCookie = useCookie('token')

const logs = ref([])
const searchQuery = ref('')
const page = ref(1)
const limit = ref(10)
const totalPages = ref(1)

const loadLogs = async () => {
  try {
    const res = await $fetch('/api/log', {
      headers: { Authorization: `Bearer ${tokenCookie.value}` },
      query: {
        page: page.value,
        limit: limit.value,
        search: searchQuery.value
      }
    })
    
    logs.value = res.data
    totalPages.value = res.meta.totalPages
  } catch (error) {
    console.error('Failed to load logs:', error)
  }
}

const changePage = (newPage) => {
  if (newPage < 1 || newPage > totalPages.value) return
  page.value = newPage
  loadLogs()
}

onMounted(() => {
  loadLogs()
})
</script>
