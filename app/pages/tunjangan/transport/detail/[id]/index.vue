<template>
  <div>
    <h3 class="card-title" v-if="tunjangan">
      Bulan {{ getMonthName(tunjangan.bulan) }} {{ tunjangan.tahun }}
    </h3>
    <div class="card">
      <div class="card-header">
        <!-- <button class="btn btn-primary" @click="infoHitung">Hitung Tunjangan</button> -->
        <div class="ms-auto">
          <div class="input-group">
            <input
              type="text"
              class="form-control"
              placeholder="Cari Data ..."
            />
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
              <th @click="handleSort('nama')" style="cursor:pointer">Nama Penerima <IconChevronUp v-if="sortBy==='nama' && sortOrder==='asc'" size="14"/><IconChevronDown v-if="sortBy==='nama' && sortOrder==='desc'" size="14"/></th>
              <th class="text-center" @click="handleSort('kilometer')" style="cursor:pointer">Kilometer <IconChevronUp v-if="sortBy==='kilometer' && sortOrder==='asc'" size="14"/><IconChevronDown v-if="sortBy==='kilometer' && sortOrder==='desc'" size="14"/></th>
              <th class="text-center" @click="handleSort('hari')" style="cursor:pointer">Jumlah Hari <IconChevronUp v-if="sortBy==='hari' && sortOrder==='asc'" size="14"/><IconChevronDown v-if="sortBy==='hari' && sortOrder==='desc'" size="14"/></th>
              <th class="text-center" @click="handleSort('nominal')" style="cursor:pointer">Nominal <IconChevronUp v-if="sortBy==='nominal' && sortOrder==='asc'" size="14"/><IconChevronDown v-if="sortBy==='nominal' && sortOrder==='desc'" size="14"/></th>
            </tr>
          </thead>
          <tbody
            v-for="(item, index) in paginatedDetailTunjangan"
            :key="item.id"
          >
            <tr>
              <td class="text-center">{{ (currentPage - 1) * limit + index + 1 }}</td>
              <td>{{ item.pegawai?.nama_pegawai || 'Anonim' }}</td>
              <td class="text-center">{{ item.kilometer }}</td>
              <td class="text-center">{{ item.jumlah_hari }}</td>
              <td class="text-end">{{ formatRupiah(item.nominal) }}</td>
            </tr>
          </tbody>
          <tbody v-if="pending">
             <tr><td colspan="5" class="text-center py-3">Memuat detail...</td></tr>
          </tbody>
        </table>
      </div>
      <div class="card-footer d-flex align-items-center">
        <ul class="pagination ms-auto m-0" v-if="totalPages > 1">
          <li class="page-item" :class="{ disabled: currentPage === 1 }">
            <a class="page-link" href="#" @click.prevent="changePage(currentPage - 1)">
              <svg xmlns="http://www.w3.org/2000/svg" class="icon" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M15 6l-6 6l6 6" /></svg>
              prev
            </a>
          </li>
          <li class="page-item" v-for="p in totalPages" :key="p" :class="{ active: p === currentPage }">
            <a class="page-link" href="#" @click.prevent="changePage(p)">{{ p }}</a>
          </li>
          <li class="page-item" :class="{ disabled: currentPage === totalPages }">
            <a class="page-link" href="#" @click.prevent="changePage(currentPage + 1)">
              next
              <svg xmlns="http://www.w3.org/2000/svg" class="icon" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M9 6l6 6l-6 6" /></svg>
            </a>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  title: "Detail Tunjangan Transport",
});

import { IconSearch, IconChevronUp, IconChevronDown } from "@tabler/icons-vue";
import { formatRupiah } from "~/utils/formatRupiah.js";
import { useRoute } from 'vue-router';

const route = useRoute();
const token = useCookie('token');
const idTunjangan = route.params.id;

// Ambil data detail dari API
const { data: response, pending } = await useFetch(`/api/tunjangan/${idTunjangan}`, {
  headers: { Authorization: `Bearer ${token.value}` }
});

if (!response.value?.data) {
  navigateTo('/tunjangan/transport');
}

const tunjangan = computed(() => response.value?.data || null);

const sortBy = ref('nama');
const sortOrder = ref('asc');

const handleSort = (column) => {
  if (sortBy.value === column) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortBy.value = column;
    sortOrder.value = 'asc';
  }
};

const sortedDetailTunjangan = computed(() => {
  if (!tunjangan.value || !tunjangan.value.detail_tunjangan) return [];
  
  let data = [...tunjangan.value.detail_tunjangan];
  
  data.sort((a, b) => {
    let valA, valB;
    if (sortBy.value === 'nama') {
      valA = (a.pegawai?.nama_pegawai || '').toLowerCase();
      valB = (b.pegawai?.nama_pegawai || '').toLowerCase();
    } else if (sortBy.value === 'kilometer') {
      valA = a.kilometer;
      valB = b.kilometer;
    } else if (sortBy.value === 'hari') {
      valA = a.jumlah_hari;
      valB = b.jumlah_hari;
    } else if (sortBy.value === 'nominal') {
      valA = a.nominal;
      valB = b.nominal;
    }
    
    if (valA < valB) return sortOrder.value === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder.value === 'asc' ? 1 : -1;
    return 0;
  });
  
  return data;
});

const currentPage = ref(1);
const limit = ref(10);

const paginatedDetailTunjangan = computed(() => {
  const start = (currentPage.value - 1) * limit.value;
  const end = start + limit.value;
  return sortedDetailTunjangan.value.slice(start, end);
});

const totalPages = computed(() => {
  return Math.ceil(sortedDetailTunjangan.value.length / limit.value);
});

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

const getMonthName = (monthNumber) => {
  if (!monthNumber) return '';
  const date = new Date();
  date.setMonth(monthNumber - 1);
  return date.toLocaleString('id-ID', { month: 'long' });
};

// Karena desain memuat tombol "Hitung Tunjangan" di dalam Detail (padahal detail itu artinya sudah terhitung), 
// kita beri alert info saja jika tombol ini ditekan.
const infoHitung = () => {
    alert("Proses 'Hitung Tunjangan' idealnya dilakukan melalui Modal di halaman utama untuk bulan yang belum di-generate.");
};
</script>
