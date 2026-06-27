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
              <th>Nama Penerima</th>
              <th class="text-center">Kilometer</th>
              <th class="text-center">Jumlah Hari</th>
              <th class="text-center">Nominal</th>
            </tr>
          </thead>
          <tbody
            v-for="(item, index) in tunjangan?.detail_tunjangan"
            :key="item.id"
          >
            <tr>
              <td class="text-center">{{ index + 1 }}</td>
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
        <ul class="pagination ms-auto m-0">
          <li class="page-item"><a class="page-link" href="#">1</a></li>
          <li class="page-item active"><a class="page-link" href="#">2</a></li>
          <li class="page-item"><a class="page-link" href="#">3</a></li>
          <li class="page-item"><a class="page-link" href="#">4</a></li>
          <li class="page-item"><a class="page-link" href="#">5</a></li>
          <li class="page-item">
            <a class="page-link" href="#">
              next
              <!-- Download SVG icon from http://tabler-icons.io/i/chevron-right -->
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="icon"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                stroke-width="2"
                stroke="currentColor"
                fill="none"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                <path d="M9 6l6 6l-6 6"></path>
              </svg>
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

import { IconSearch } from "@tabler/icons-vue";
import { formatRupiah } from "~/utils/formatRupiah.js";
import { useRoute } from 'vue-router';

const route = useRoute();
const token = useCookie('token');
const idTunjangan = route.params.id;

// Ambil data detail dari API
const { data: response, pending } = await useFetch(`/api/tunjangan/${idTunjangan}`, {
  headers: { Authorization: `Bearer ${token.value}` }
});

const tunjangan = computed(() => response.value?.data || null);

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
