<template>
  <div class="card">
    <div class="card-header">
      <div class="d-flex gap-2 ms-auto">
        <!-- Filter Role -->
        <select name="" id="" class="form-select" style="width: 180px">
          <option value="">Semua Role</option>
          <option v-for="item in listRole" :key="item.id" :value="item.id">{{ item.nama_role }}</option>
        </select>

        <!-- Search -->
        <div class="input-group">
          <input type="text" class="form-control" placeholder="Cari Data ..." />
          <button class="btn" type="button">
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
            <th>Role</th>
            <th>Deskripsi</th>
            <th class="text-center">Aksi</th>
          </tr>
        </thead>
        <tbody v-for="(item, index) in listRole" :key="item.id">
          <tr>
            <td class="text-center">{{ index + 1 }}</td>
            <td>{{ item.nama_role }}</td>
            <td>-</td> <td class="text-center">
              <NuxtLink
                :to="`role/hak-akses/${item.id}`"
                class="btn btn-sm btn-primary"
                >Hak Akses
              </NuxtLink>
            </td>
          </tr>
        </tbody>
        <tbody v-if="pending">
          <tr><td colspan="4" class="text-center py-3">Memuat data...</td></tr>
        </tbody>
      </table>
    </div>
    <div class="card-footer d-flex align-items-center">
      <ul class="pagination ms-auto m-0" v-if="meta.totalPages > 1">
        <li class="page-item" :class="{ disabled: currentPage === 1 }">
          <a class="page-link" href="#" @click.prevent="changePage(currentPage - 1)">
            <svg xmlns="http://www.w3.org/2000/svg" class="icon" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M15 6l-6 6l6 6" /></svg>
            prev
          </a>
        </li>
        <li class="page-item" v-for="p in meta.totalPages" :key="p" :class="{ active: p === currentPage }">
          <a class="page-link" href="#" @click.prevent="changePage(p)">{{ p }}</a>
        </li>
        <li class="page-item" :class="{ disabled: currentPage === meta.totalPages }">
          <a class="page-link" href="#" @click.prevent="changePage(currentPage + 1)">
            next
            <svg xmlns="http://www.w3.org/2000/svg" class="icon" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M9 6l6 6l-6 6" /></svg>
          </a>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  title: "Manajemen Role",
});

useSeoMeta({
  title: "Manajemen Role",
});

import { IconSearch } from "@tabler/icons-vue";

const token = useCookie('token');

const currentPage = ref(1);
const limit = ref(10);

// get data dari API
const { data: response, pending } = await useFetch('/api/user/role', {
  headers: { Authorization: `Bearer ${token.value}` },
  query: {
    page: currentPage,
    limit: limit
  },
  watch: [currentPage]
});

const meta = computed(() => response.value?.meta || { totalPages: 1, page: 1, total: 0 });
const listRole = computed(() => response.value?.data || []);

const changePage = (page) => {
  if (page >= 1 && page <= meta.value.totalPages) {
    currentPage.value = page;
  }
};
</script>
