<template>
  <div class="card">
    <div class="card-header">
      <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#modalHitung">
        Hitung Tunjangan
      </button>
      <div class="d-flex gap-2 ms-auto">
        <!-- Filter Tahun -->
        <select name="" id="" class="form-select" style="width: 180px">
          <option value="">Semua Tahun</option>
          <option value="">2026</option>
          <option value="">2025</option>
          <option value="">2024</option>
          <option value="">2023</option>
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
            <th>Nama Bulan</th>
            <th class="text-center">Total Penerima</th>
            <th class="text-center">Total Tunjangan Transport</th>
            <th class="text-center">Aksi</th>
          </tr>
        </thead>
        <tbody v-for="(item, index) in listTunjangan" :key="item.id">
          <tr>
            <td class="text-center">{{ index + 1 }}</td>
            <td>{{ getMonthName(item.bulan) }} {{ item.tahun }}</td>
            <td class="text-center">{{ item.total_penerima }}</td>
            <td class="text-end">{{ formatRupiah(item.total_tunjangan) }}</td>
            <td class="text-center">
              <NuxtLink
                :to="`/tunjangan/transport/detail/${item.id}`"
                class="btn btn-primary btn-sm"
                >Detail</NuxtLink
              >
            </td>
          </tr>
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
    <div class="modal fade" id="modalHitung" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Hitung Tunjangan Transport</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">Pilih Bulan</label>
              <select class="form-select" v-model="formGenerate.bulan">
                <option v-for="m in 12" :key="m" :value="m">{{ getMonthName(m) }}</option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label">Tahun</label>
              <input type="number" class="form-control" v-model="formGenerate.tahun" />
            </div>
            <div class="mb-3">
              <label class="form-label">Jumlah Hari Kerja (Pukul Rata)</label>
              <input type="number" class="form-control" v-model="formGenerate.hari_kerja" placeholder="Contoh: 22" />
              <small class="text-muted">Sistem akan mengalikan nominal tarif transport per km dengan jumlah hari ini untuk semua pegawai aktif.</small>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Batal</button>
            <button type="button" class="btn btn-primary" @click="generateTunjangan" :disabled="isGenerating">
              {{ isGenerating ? 'Menghitung...' : 'Hitung Sekarang' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  title: "Tunjangan Transport",
});
useSeoMeta({
  title: "Tunjangan Transport",
});

import { ref, computed } from 'vue';
import { IconSearch } from "@tabler/icons-vue";
import { formatRupiah } from "~/utils/formatRupiah.js";

const token = useCookie('token');
const currentPage = ref(1);
const limit = ref(10);

// Mengambil list tunjangan dari backend API yang kita buat sebelumnya
const { data: response, pending, refresh } = await useFetch('/api/tunjangan', {
  headers: { Authorization: `Bearer ${token.value}` },
  query: {
    page: currentPage,
    limit: limit
  },
  watch: [currentPage]
});

const meta = computed(() => response.value?.meta || { totalPages: 1, page: 1, total: 0 });
const listTunjangan = computed(() => response.value?.data || []);

const changePage = (page) => {
  if (page >= 1 && page <= meta.value.totalPages) {
    currentPage.value = page;
  }
};

// --- LOGIKA HITUNG TUNJANGAN ---
const isGenerating = ref(false);
const formGenerate = ref({
  bulan: new Date().getMonth() + 1, // Default bulan ini
  tahun: new Date().getFullYear(),  // Default tahun ini
  hari_kerja: 22                    // Asumsi standar hari kerja
});

const getMonthName = (monthNumber) => {
  const date = new Date();
  date.setMonth(monthNumber - 1);
  return date.toLocaleString('id-ID', { month: 'long' });
};

const generateTunjangan = async () => {
  if (!formGenerate.value.hari_kerja || formGenerate.value.hari_kerja <= 0) {
    alert("Jumlah hari kerja harus lebih dari 0");
    return;
  }

  isGenerating.value = true;
  try {
    const resPegawai = await $fetch('/api/pegawai', {
      headers: { Authorization: `Bearer ${token.value}` }
    });

    const pegawaiAktif = resPegawai.data.filter(p => p.status === 'Aktif');
    if (pegawaiAktif.length === 0) {
      alert("Tidak ada pegawai aktif untuk dihitung!");
      isGenerating.value = false;
      return;
    }

    const data_hari_kerja = {};
    pegawaiAktif.forEach(p => {
      data_hari_kerja[p.id.toString()] = formGenerate.value.hari_kerja;
    });

    await $fetch('/api/tunjangan/generate', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token.value}` },
      body: {
        bulan: formGenerate.value.bulan,
        tahun: formGenerate.value.tahun,
        data_hari_kerja: data_hari_kerja
      }
    });

    alert("Data tunjangan berhasil dihitung dan disimpan!");
    refresh();
    
  } catch (error) {
    console.error(error);
    alert(error?.data?.statusMessage || error?.message || "Terjadi kesalahan saat menghitung tunjangan.");
  } finally {
    isGenerating.value = false;
  }
};
</script>
