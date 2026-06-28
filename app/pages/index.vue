<script setup>
definePageMeta({
  title: "Dashboard",
});

useSeoMeta({
  title: "Dashboard",
});

import { ref, computed } from 'vue';
import { 
  IconUsers, 
  IconUserCheck, 
  IconUserMinus, 
  IconUserScan 
} from '@tabler/icons-vue';

const token = useCookie('token');
const currentUser = ref(null);

if (import.meta.client) {
  try {
    if (token.value) {
      const payload = token.value.split('.')[1];
      currentUser.value = JSON.parse(atob(payload));
    }
  } catch (e) {
    console.error(e);
  }
}

// Fetch dashboard stats
const { data: resStats, pending } = await useFetch('/api/dashboard/stats', {
  headers: {
    Authorization: `Bearer ${token.value}`
  }
});

const stats = computed(() => resStats.value?.data || {
  totalPegawai: 0,
  totalKontrak: 0,
  totalTetap: 0,
  totalMagang: 0,
  totalPria: 0,
  totalWanita: 0,
  pegawaiTerbaru: []
});

const dataPegawaiTerbaru = computed(() => stats.value.pegawaiTerbaru);

const isManager = computed(() => currentUser.value?.role_name === 'Manager HRD');
const userRoleName = computed(() => currentUser.value?.role_name || 'Unknown');
const userFullName = computed(() => currentUser.value?.nama || currentUser.value?.username || 'Pengguna');

const totalStatistik = computed(() => [
  {
    title: "Total Pegawai",
    value: stats.value.totalPegawai,
    icon: IconUsers,
    backgroundColor: "#206bc4",
  },
  {
    title: "Total Pegawai Kontrak",
    value: stats.value.totalKontrak,
    icon: IconUserMinus,
    backgroundColor: "#4299e1",
  },
  {
    title: "Total Pegawai Tetap",
    value: stats.value.totalTetap,
    icon: IconUserCheck,
    backgroundColor: "#2fb344",
  },
  {
    title: "Total Peserta Magang",
    value: stats.value.totalMagang,
    icon: IconUserScan,
    backgroundColor: "#f76707",
  }
]);

const statusPegawaiSeries = computed(() => [
  stats.value.totalKontrak,
  stats.value.totalTetap,
  stats.value.totalMagang
]);

const genderPegawaiSeries = computed(() => [
  stats.value.totalPria,
  stats.value.totalWanita
]);

const statusPegawaiOptions = {
  chart: { type: "donut", height: 200 },
  labels: ["PKWT", "PKWTT", "Magang"],
  colors: [
    "rgba(84, 128, 199, 1)",
    "rgba(43, 80, 142, 1)",
    "rgba(254, 126, 0, 1)",
  ],
  legend: { position: "bottom" },
  dataLabels: { enabled: true },
};

const genderPegawaiOptions = {
  chart: { type: "donut", height: 200 },
  labels: ["Laki-laki", "Perempuan"],
  colors: ["rgba(43, 80, 142, 1)", "rgba(254, 126, 0, 1)"],
  legend: { position: "bottom" },
  dataLabels: { enabled: true },
};
</script>

<template>
  <div class="row g-3">
    <!-- Card Greeting (Manager HRD) -->
    <div class="col-md-3" v-if="isManager">
      <div class="card bg-dark h-100 position-relative">
        <div class="card-body">
          <div class="text-center">
            <img
              src="@/assets/images/greeting-img.svg"
              alt=""
              class="img-fluid mb-4"
            />
          </div>
          <h3 class="card-title text-white">
            Selamat Datang {{ userFullName }} - {{ userRoleName }}
          </h3>
          <p class="text-white fw-lighter fst-italic">
            "Fokuskan tujuan yang ingin didapat, jangan biarkan faktor lain
            menghalangi tujuan Anda"
          </p>
        </div>
      </div>
    </div>

    <!-- Stats Manager HRD -->
    <div class="col-md-9" v-if="isManager">
      <div class="row g-3">
        <!-- Card Total -->
        <div class="col-12">
          <div class="card">
            <div class="card-body">
              <div class="row g-3">
                <div
                  class="col-md-6 col-lg-3"
                  v-for="(item, index) in totalStatistik"
                  :key="index"
                >
                  <div class="row align-items-center">
                    <div class="col-auto">
                      <div
                        class="d-flex rounded-circle"
                        :style="{
                          width: '56px',
                          height: '56px',
                          background: item.backgroundColor,
                        }"
                      >
                        <component
                          :is="item.icon"
                          :stroke="2"
                          class="m-auto text-white"
                        />
                      </div>
                    </div>

                    <div class="col">
                      <h3 class="fs-2 mb-1">{{ item.value }}</h3>
                      <p class="text-secondary fw-light mb-0">
                        {{ item.title }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- Chart Total Pegawai Berdasarkan Status Kontrak -->
        <div class="col-md-6">
          <div class="card">
            <div class="card-body">
              <h3 class="card-title">
                Total Pegawai Berdasarkan Status Kontrak
              </h3>
              <ClientOnly>
                <apexchart
                  type="donut"
                  height="200"
                  :options="statusPegawaiOptions"
                  :series="statusPegawaiSeries"
                />
              </ClientOnly>
            </div>
          </div>
        </div>
        <!-- Chart Total Pegawai Berdasarkan Gender -->
        <div class="col-md-6">
          <div class="card">
            <div class="card-body">
              <h3 class="card-title">Total Pegawai Berdasarkan Gender</h3>
              <ClientOnly>
                <apexchart
                  type="donut"
                  height="200"
                  :options="genderPegawaiOptions"
                  :series="genderPegawaiSeries"
                />
              </ClientOnly>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Pegawai Terbaru (Manager HRD) -->
    <div class="col-12" v-if="isManager">
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Data Pegawai Terbaru</h3>
        </div>
        <div class="table-responsive card-body p-0">
          <table class="table table-vcenter table-striped card-table">
            <thead>
              <tr>
                <th class="w-1">No</th>
                <th>NIPP</th>
                <th>Nama Lengkap</th>
                <th>Tanggal Masuk</th>
                <th>Status Kepegawaian</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in dataPegawaiTerbaru" :key="item.nipp">
                <td class="text-center">{{ index + 1 }}</td>
                <td>{{ item.nipp }}</td>
                <td>
                  <div class="d-flex align-items-center gap-1">
                    <img
                      :src="`/images/pegawai/${item.photo}`"
                      alt=""
                      style="width: 32px; height: 32px"
                      class="rounded-pill"
                    />
                    <p class="mb-0">
                      {{ item.nama }}
                    </p>
                  </div>
                </td>
                <td>{{ item.tanggalMasuk }}</td>
                <td>{{ item.status }}</td>
                <td>
                  <NuxtLink
                    :to="`/pegawai/${item.nipp}`"
                    class="btn btn-primary btn-sm"
                  >
                    Detail Pegawai
                  </NuxtLink>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Tampilan Untuk Role Selain Manager HRD -->
    <div class="col-12" v-if="!isManager">
      <div class="card bg-dark">
        <div class="card-body text-center py-5">
          <h3 class="text-white" style="font-size: 1.8rem; margin: 0;">
            Selamat Datang {{ userFullName }} - {{ userRoleName }}
          </h3>
        </div>
      </div>
    </div>
  </div>
</template>
