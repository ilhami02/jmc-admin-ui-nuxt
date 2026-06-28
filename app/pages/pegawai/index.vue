<script setup>
definePageMeta({
  title: "Data Pegawai",
  layout: false,
});

useSeoMeta({
  title: "Data Pegawai",
});

import {
  IconPencil,
  IconPlus,
  IconSearch,
  IconTrash,
  IconFileDescription,
  IconCloudDownload,
  IconChevronUp,
  IconChevronDown,
  IconFileTypeXls,
  IconFileTypePdf
} from "@tabler/icons-vue";
import { formatDateID } from "~/utils/formatDate.js";
import { ref, computed, watch, onMounted } from 'vue';

import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const token = useCookie('token') // get JWT

// STATE
const page = ref(1);
const limit = ref(10);
const search = ref('');
const sortBy = ref('created_at');
const sortOrder = ref('desc');
const jabatanFilter = ref('');
const masaKerjaMin = ref('');
const masaKerjaMax = ref('');
const statusKontrak = ref('');

// JABATAN LOAD
const listJabatan = ref([]);
const loadJabatan = async () => {
  try {
    const res = await $fetch('/api/master-data?tipe=Jabatan', { headers: { Authorization: `Bearer ${token.value}` } });
    listJabatan.value = res.data || [];
  } catch(e) {}
}

// FETCH
const { data: response, pending, refresh } = await useFetch('/api/pegawai', {
  headers: { Authorization: `Bearer ${token.value}` },
  query: {
    page, limit, search, sort_by: sortBy, sort_order: sortOrder,
    jabatan: jabatanFilter, masa_kerja_min: masaKerjaMin,
    masa_kerja_max: masaKerjaMax, status_kontrak: statusKontrak
  }
});
const pegawaiList = computed(() => response.value?.data || []);
const meta = computed(() => response.value?.meta || { totalPages: 1, page: 1, totalRows: 0 });

const hitungMasaKerja = (tanggalMasuk) => {
  if (!tanggalMasuk) return 0;
  const tglMasuk = new Date(tanggalMasuk);
  const sekarang = new Date();
  let selisihTahun = sekarang.getFullYear() - tglMasuk.getFullYear();
  if (sekarang.getMonth() < tglMasuk.getMonth() || (sekarang.getMonth() === tglMasuk.getMonth() && sekarang.getDate() < tglMasuk.getDate())) {
    selisihTahun--;
  }
  return selisihTahun;
};

// SORT
const handleSort = (column) => {
  if (sortBy.value === column) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortBy.value = column;
    sortOrder.value = 'asc';
  }
};

// BULK
const selectedItems = ref([]);
const isAllSelected = computed(() => {
  return pegawaiList.value.length > 0 && selectedItems.value.length === pegawaiList.value.length;
});
const toggleSelectAll = (e) => {
  if (e.target.checked) selectedItems.value = pegawaiList.value.map(p => p.id);
  else selectedItems.value = [];
};
watch(pegawaiList, () => { selectedItems.value = []; });

const statusUbah = ref('Aktif');
const bulkUpdateStatus = async () => {
  if (!selectedItems.value.length) return;
  try {
    await $fetch('/api/pegawai/bulk-status', {
      method: 'PUT', headers: { Authorization: `Bearer ${token.value}` },
      body: { ids: selectedItems.value, status: statusUbah.value }
    });
    alert(`Status diubah menjadi ${statusUbah.value}`);
    selectedItems.value = [];
    refresh();
  } catch(e) { alert('Gagal mengubah status'); }
};

const bulkDelete = async () => {
  if (!selectedItems.value.length) return;
  if(!confirm(`Hapus ${selectedItems.value.length} data?`)) return;
  try {
    await $fetch('/api/pegawai/bulk-delete', {
      method: 'DELETE', headers: { Authorization: `Bearer ${token.value}` },
      body: { ids: selectedItems.value }
    });
    alert('Data dihapus');
    selectedItems.value = [];
    refresh();
  } catch(e) { alert('Gagal menghapus'); }
};

// DELETE
const selectedId = ref(null);
const hapusData = async () => {
  if (!selectedId.value) return;
  try {
    await $fetch(`/api/pegawai/${selectedId.value}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token.value}` } });
    alert("Berhasil menghapus data!");
    refresh(); 
  } catch (error) { alert("Gagal menghapus data."); }
};

// EXPORT
const exportExcel = () => {
  if (pegawaiList.value.length === 0) return alert('Tidak ada data');
  const data = pegawaiList.value.map((p, index) => ({
    No: (meta.value.page - 1) * limit.value + index + 1,
    NIP: p.nip, 
    'Nama Lengkap': p.nama_pegawai, 
    Email: p.email || '-',
    'Nomor HP': p.nomor_hp || '-',
    'Tempat Lahir': p.tempat_lahir || '-',
    'Tanggal Lahir': formatDateID(p.tanggal_lahir),
    'Usia': p.usia ? `${p.usia} Tahun` : '-',
    'Jenis Kelamin': p.jenis_kelamin || '-',
    'Status Pernikahan': p.status_kawin === 'tidak_kawin' ? 'Tidak Kawin' : (p.status_kawin || '-'),
    'Jumlah Anak': p.jumlah_anak || 0,
    'Alamat': p.alamat_lengkap || '-',
    'Kecamatan': p.kecamatan?.kecamatan || '-',
    'Kabupaten': p.kecamatan?.kabupaten || '-',
    'Provinsi': p.kecamatan?.provinsi || '-',
    'Tanggal Masuk': formatDateID(p.tanggal_masuk), 
    'Jabatan': p.jabatan?.nama || '-',
    'Departemen': p.departemen?.nama || '-',
    'Status Kontrak': p.status_kontrak || '-',
    'Status Pegawai': p.status || '-',
    'Masa Kerja': hitungMasaKerja(p.tanggal_masuk) + ' Tahun'
  }));
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Pegawai");
  XLSX.writeFile(wb, "Data_Pegawai.xlsx");
};

const exportPDF = () => {
  if (pegawaiList.value.length === 0) return alert('Tidak ada data');
  const doc = new jsPDF('l', 'mm', 'a4'); // Gunakan format Landscape agar muat banyak kolom
  doc.text("Daftar Pegawai", 14, 15);
  const tableData = pegawaiList.value.map((p, index) => [
    (meta.value.page - 1) * limit.value + index + 1, 
    p.nip, 
    p.nama_pegawai, 
    p.email || '-',
    p.nomor_hp || '-',
    formatDateID(p.tanggal_lahir),
    p.jenis_kelamin || '-',
    p.status_kawin === 'tidak_kawin' ? 'Tidak Kawin' : (p.status_kawin || '-'),
    p.alamat_lengkap || '-',
    p.kecamatan?.kecamatan || '-',
    formatDateID(p.tanggal_masuk), 
    p.jabatan?.nama || '-',
    p.departemen?.nama || '-',
    p.status_kontrak || '-',
    p.status || '-',
    hitungMasaKerja(p.tanggal_masuk) + ' Thn'
  ]);
  
  autoTable(doc, { 
    head: [['No', 'NIP', 'Nama', 'Email', 'No HP', 'Tgl Lahir', 'L/P', 'Status', 'Alamat', 'Kec', 'Tgl Masuk', 'Jabatan', 'Dept', 'Kontrak', 'St.Pegawai', 'Masa Kerja']], 
    body: tableData, 
    startY: 20,
    styles: { fontSize: 6, cellPadding: 1 },
    headStyles: { fillColor: [32, 107, 196] } // warna biru tabler
  });
  doc.save("Data_Pegawai.pdf");
};

const exportPdfDetail = (item) => {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text("Data Detail Pegawai", 14, 15);
  
  const detailData = [
    ['NIP', item.nip],
    ['Nama Lengkap', item.nama_pegawai],
    ['Email', item.email || '-'],
    ['Nomor HP', item.nomor_hp || '-'],
    ['Tempat Lahir', item.tempat_lahir || '-'],
    ['Tanggal Lahir', formatDateID(item.tanggal_lahir)],
    ['Usia', item.usia ? `${item.usia} Tahun` : '-'],
    ['Jenis Kelamin', item.jenis_kelamin || '-'],
    ['Status Pernikahan', item.status_kawin === 'tidak_kawin' ? 'Tidak Kawin' : (item.status_kawin || '-')],
    ['Jumlah Anak', item.jumlah_anak?.toString() || '0'],
    ['Alamat', item.alamat_lengkap || '-'],
    ['Lokasi', item.kecamatan ? `${item.kecamatan.kecamatan}, ${item.kecamatan.kabupaten}, ${item.kecamatan.provinsi}` : '-'],
    ['Tanggal Masuk', formatDateID(item.tanggal_masuk)],
    ['Jabatan', item.jabatan?.nama || '-'],
    ['Departemen', item.departemen?.nama || '-'],
    ['Status Kontrak', item.status_kontrak || '-'],
    ['Status Pegawai', item.status || '-'],
    ['Masa Kerja', hitungMasaKerja(item.tanggal_masuk) + ' Tahun']
  ];

  autoTable(doc, {
    body: detailData,
    startY: 22,
    theme: 'grid',
    styles: { fontSize: 10, cellPadding: 3 },
    columnStyles: {
      0: { fontStyle: 'bold', fillColor: [241, 245, 249], cellWidth: 50 },
      1: { cellWidth: 'auto' }
    }
  });

  doc.save(`Detail_${item.nip}.pdf`);
};

onMounted(() => { loadJabatan(); });
</script>

<template>
  <NuxtLayout name="default">
    <template #actions>
      <!-- Tambahan: Bulk Actions (hanya tampil jika ada baris terpilih) -->
      <div v-if="selectedItems.length > 0" class="d-inline-flex gap-2 me-2 align-items-center">
        <select class="form-select form-select-sm" style="width: 120px" v-model="statusUbah">
          <option value="Aktif">Aktif</option>
          <option value="Nonaktif">Nonaktif</option>
        </select>
        <button class="btn btn-primary btn-sm" @click="bulkUpdateStatus">Ubah Status</button>
        <button class="btn btn-danger btn-sm" @click="bulkDelete">
          <IconTrash stroke="{2}" size="16" class="me-1" /> Hapus
        </button>
      </div>
      <!-- Tambahan: Export Buttons -->
      <div class="d-inline-flex gap-2 me-2">
        <button class="btn btn-outline-success" @click="exportExcel">Excel</button>
        <button class="btn btn-outline-danger" @click="exportPDF">PDF</button>
      </div>

      <NuxtLink to="/pegawai/form" class="btn btn-primary">
        <IconPlus stroke="{3}" size="20" />Tambah
      </NuxtLink>
    </template>
    <div class="card">
      <div class="card-header">
        <div class="d-flex gap-2 ms-auto">
          <!-- Masa Kerja -->
          <div class="d-flex align-items-center gap-1">
            <span class="text-nowrap">Masa Kerja</span>
            <input type="number" class="form-control" style="width: 60px" v-model="masaKerjaMin" placeholder="Min" />
            -
            <input type="number" class="form-control" style="width: 60px" v-model="masaKerjaMax" placeholder="Max" />
          </div>
          <!-- Filter Jabatan -->
          <select class="form-select" style="width: 180px" v-model="jabatanFilter">
            <option value="">Semua Jabatan</option>
            <option v-for="j in listJabatan" :key="j.id" :value="j.id">{{ j.nama }}</option>
          </select>

          <!-- Filter Kontrak -->
          <select name="" id="" class="form-select" style="width: 180px" v-model="statusKontrak">
            <option value="">Status Kontrak</option>
            <option value="PKWTT">PKWTT</option>
            <option value="PKWT">PKWT</option>
          </select>

          <!-- Search -->
          <div class="input-group" style="width: 200px">
            <input
              type="text"
              class="form-control"
              placeholder="Cari Data ..."
              v-model="search"
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
              <th width="10" class="text-center">
                <input type="checkbox" class="form-check-input" :checked="isAllSelected" @change="toggleSelectAll" />
              </th>
              <th width="5">No</th>
              <th width="15" class="text-center">Aksi</th>
              <th @click="handleSort('nip')" style="cursor:pointer">NIP <IconChevronUp v-if="sortBy==='nip' && sortOrder==='asc'" size="14"/><IconChevronDown v-if="sortBy==='nip' && sortOrder==='desc'" size="14"/></th>
              <th @click="handleSort('nama')" style="cursor:pointer">Nama <IconChevronUp v-if="sortBy==='nama' && sortOrder==='asc'" size="14"/><IconChevronDown v-if="sortBy==='nama' && sortOrder==='desc'" size="14"/></th>
              <th @click="handleSort('jabatan')" style="cursor:pointer">Jabatan <IconChevronUp v-if="sortBy==='jabatan' && sortOrder==='asc'" size="14"/><IconChevronDown v-if="sortBy==='jabatan' && sortOrder==='desc'" size="14"/></th>
              <th @click="handleSort('tanggal_masuk')" style="cursor:pointer">Tanggal Masuk <IconChevronUp v-if="sortBy==='tanggal_masuk' && sortOrder==='asc'" size="14"/><IconChevronDown v-if="sortBy==='tanggal_masuk' && sortOrder==='desc'" size="14"/></th>
              <th @click="handleSort('masa_kerja')" style="cursor:pointer">Masa Kerja <IconChevronUp v-if="sortBy==='masa_kerja' && sortOrder==='asc'" size="14"/><IconChevronDown v-if="sortBy==='masa_kerja' && sortOrder==='desc'" size="14"/></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in pegawaiList" :key="item.id">
              <td class="text-center">
                <input type="checkbox" class="form-check-input" :value="item.id" v-model="selectedItems" />
              </td>
              <td class="text-center">{{ (meta.page - 1) * limit + index + 1 }}</td>
              <td class="text-nowrap">
                <div class="d-flex">
                  <!-- Aksi Edit -->
                  <NuxtLink :to="`/pegawai/form/${item.nip}`" class="text-dark">
                    <span
                      data-bs-toggle="tooltip"
                      data-bs-placement="bottom"
                      title="Edit"
                    >
                      <IconPencil stroke="{1}" size="20" />
                    </span>
                  </NuxtLink>

                  <!-- Aksi Detail -->
                  <NuxtLink :to="`/pegawai/${item.nip}`" class="text-dark">
                    <span
                      data-bs-toggle="tooltip"
                      data-bs-placement="bottom"
                      title="Detail"
                    >
                      <IconFileDescription stroke="{1}" size="20" />
                    </span>
                  </NuxtLink>

                  <!-- Aksi Download -->
                  <a href="#" class="text-dark" @click.prevent="exportPdfDetail(item)">
                    <span
                      data-bs-toggle="tooltip"
                      data-bs-placement="bottom"
                      title="Download PDF Detail"
                    >
                      <IconCloudDownload stroke="{1}" size="20" />
                    </span>
                  </a>

                  <!-- Aksi Hapus -->
                  <a
                    href="#"
                    class="text-danger"
                    data-bs-toggle="modal"
                    data-bs-target="#modal-hapus"
                    @click="selectedId = item.id"
                  >
                    <span
                      data-bs-toggle="tooltip"
                      data-bs-placement="bottom"
                      title="Hapus"
                    >
                      <IconTrash stroke="{1}" size="20" />
                    </span>
                  </a>
                </div>
              </td>
              <!-- <td>{{ item.nip }}</td>
              <td>{{ item.nama }}</td>
              <td>{{ item.jabatan }}</td>
              <td>{{ formatDateID(item.tanggalMasuk) }}</td>
              <td>{{ item.masaKerja }}</td> -->
              <td>{{ item.nip }}</td>
              <td>{{ item.nama_pegawai }}</td>
              <td>{{ item.jabatan?.nama || '-' }}</td> 
              <td>{{ formatDateID(item.tanggal_masuk) }}</td>
              <td>{{ hitungMasaKerja(item.tanggal_masuk) }} Tahun</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="card-footer d-flex align-items-center">
        <div class="m-0 text-muted">
          Menampilkan baris <span>{{ (meta.page - 1) * limit + 1 }}</span> sampai 
          <span>{{ Math.min(meta.page * limit, meta.totalRows) }}</span> dari 
          <span>{{ meta.totalRows }}</span> entri
        </div>
        <ul class="pagination ms-auto m-0">
          <li class="page-item" :class="{ disabled: meta.page === 1 }">
            <a class="page-link" href="#" @click.prevent="page = meta.page - 1">prev</a>
          </li>
          <li class="page-item" v-for="p in meta.totalPages" :key="p" :class="{ active: p === meta.page }">
            <a class="page-link" href="#" @click.prevent="page = p">{{ p }}</a>
          </li>
          <li class="page-item" :class="{ disabled: meta.page === meta.totalPages || meta.totalPages === 0 }">
            <a class="page-link" href="#" @click.prevent="page = meta.page + 1">
              next
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

      <!-- Modal Hapus -->
      <div class="modal modal-blur fade" id="modal-hapus">
        <div
          class="modal-dialog modal-sm modal-dialog-centered"
          role="document"
        >
          <div class="modal-content">
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
            <div class="modal-status bg-danger"></div>
            <div class="modal-body text-center py-4">
              <!-- Download SVG icon from http://tabler.io/icons/icon/alert-triangle -->
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="icon mb-2 text-danger icon-lg"
              >
                <path d="M12 9v4"></path>
                <path
                  d="M10.363 3.591l-8.106 13.534a1.914 1.914 0 0 0 1.636 2.871h16.214a1.914 1.914 0 0 0 1.636 -2.87l-8.106 -13.536a1.914 1.914 0 0 0 -3.274 0z"
                ></path>
                <path d="M12 16h.01"></path>
              </svg>
              <h3 class="mb-1">Hapus Data</h3>
              <div class="text-secondary">
                Apakah kamu ingin menghapus data ini ?
              </div>
            </div>
            <div class="modal-footer">
              <div class="w-100">
                <div class="row">
                  <div class="col">
                    <a href="#" class="btn btn-3 w-100" data-bs-dismiss="modal">
                      Batal
                    </a>
                  </div>
                  <div class="col">
                    <a
                      href="#"
                      class="btn btn-danger btn-4 w-100"
                      data-bs-dismiss="modal"
                      @click="hapusData"
                    >
                      Hapus
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>
