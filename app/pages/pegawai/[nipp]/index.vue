<template>
  <div class="row g-3">
    <div class="col-lg-6">
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Data Diri</h3>
        </div>
        <div class="card-body">
          <div class="row g-4">
            <div class="col-12">
              <div class="row align-items-center">
                <!-- Foto -->
                <div class="col-auto">
                  <img
                    :src="pegawai.foto_pegawai || '/images/default-avatar.png'"
                    alt=""
                    class="foto-ptofil"
                  />
                </div>

                <div class="col">
                  <!-- NIP -->
                  <div class="datagrid-item mb-4">
                    <div class="datagrid-title">NIP</div>
                    <div class="datagrid-content">{{ pegawai.nip }}</div>
                  </div>

                  <!-- Nama Lengkap -->
                  <div class="datagrid-item">
                    <div class="datagrid-title">Nama Lengkap</div>
                    <div class="datagrid-content">{{ pegawai.nama_pegawai }}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Email -->
            <div class="col-md-6">
              <div class="datagrid-item">
                <div class="datagrid-title">Email</div>
                <div class="datagrid-content">{{ pegawai.email }}</div>
              </div>
            </div>

            <!-- No HP -->
            <div class="col-md-6">
              <div class="datagrid-item">
                <div class="datagrid-title">Nomor HP</div>
                <div class="datagrid-content">{{ pegawai.nomor_hp }}</div>
              </div>
            </div>

            <!-- Tempat Lahir -->
            <div class="col-md-6">
              <div class="datagrid-item">
                <div class="datagrid-title">Tempat Lahir</div>
                <div class="datagrid-content">{{ pegawai.tempat_lahir }}</div>
              </div>
            </div>

            <!-- Tanggal Lahir -->
            <div class="col-md-6">
              <div class="datagrid-item">
                <div class="datagrid-title">Tanggal Lahir</div>
                <div class="datagrid-content">{{ formatDateID(pegawai.tanggal_lahir) }}</div>
              </div>
            </div>

            <!-- Usia -->
            <div class="col-md-6">
              <div class="datagrid-item">
                <div class="datagrid-title">Usia</div>
                <div class="datagrid-content">{{ pegawai.usia }} tahun</div>
              </div>
            </div>

            <!-- Pendidikan -->
            <div class="col-md-6">
              <div class="datagrid-item">
                <div class="datagrid-title">Pendidikan</div>
                <template v-if="pegawai.pendidikan && pegawai.pendidikan.length > 0">
                  <div 
                    v-for="edu in pegawai.pendidikan" 
                    :key="edu.id" 
                    class="datagrid-content"
                  >
                    {{ edu.tingkat_pendidikan }} / {{ edu.nama_sekolah }} / {{ edu.tahun_lulus }}
                  </div>
                </template>
                
                <template v-else>
                  <div class="datagrid-content text-muted">-</div>
                </template>
              </div>
            </div>

            <!-- Alamat Lengkap -->
            <div class="col-12">
              <div class="datagrid-item">
                <div class="datagrid-title">Alamat Lengkap</div>
                <div class="datagrid-content">
                  {{ pegawai.alamat_lengkap }}
                </div>
              </div>
            </div>

            <!-- Kecamatan -->
            <div class="col-md-4">
              <div class="datagrid-item">
                <div class="datagrid-title">Kecamatan</div>
                <div class="datagrid-content">{{pegawai.kecamatan?.kecamatan}}</div>
              </div>
            </div>

            <!-- Kabupaten -->
            <div class="col-md-4">
              <div class="datagrid-item">
                <div class="datagrid-title">Kabupaten</div>
                <div class="datagrid-content">{{ pegawai.kecamatan?.kabupaten }}</div>
              </div>
            </div>

            <!-- Provinsi -->
            <div class="col-md-4">
              <div class="datagrid-item">
                <div class="datagrid-title">Provinsi</div>
                <div class="datagrid-content">{{pegawai.kecamatan?.provinsi}}</div>
              </div>
            </div>

            <!-- Status Pernikahan -->
            <div class="col-md-4">
              <div class="datagrid-item">
                <div class="datagrid-title">Status Pernikahan</div>
                <div class="datagrid-content">{{ pegawai.status_kawin === 'tidak_kawin' ? 'Tidak Kawin' : pegawai.status_kawin || '-' }}</div>
              </div>
            </div>

            <!-- Jenis Kelamin -->
            <div class="col-md-4">
              <div class="datagrid-item">
                <div class="datagrid-title">Jenis Kelamin</div>
                <div class="datagrid-content">{{ pegawai.jenis_kelamin || '-' }}</div>
              </div>
            </div>

            <!-- Jumlah Anak -->
            <div class="col-md-4">
              <div class="datagrid-item">
                <div class="datagrid-title">Jumlah Anak</div>
                <div class="datagrid-content">{{ pegawai.jumlah_anak }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="col-lg-6">
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Data Kepegawaian</h3>
        </div>
        <div class="card-body">
          <div class="row g-4">
            <!-- Tanggal Masuk -->
            <div class="col-12">
              <div class="datagrid-item">
                <div class="datagrid-title">Tanggal Masuk</div>
                <div class="datagrid-content">{{ formatDateID(pegawai.tanggal_masuk) }}</div>
              </div>
            </div>

            <!-- Jabatan -->
            <div class="col-md-6">
              <div class="datagrid-item">
                <div class="datagrid-title">Jabatan</div>
                <div class="datagrid-content">{{ pegawai.jabatan?.nama }}</div>
              </div>
            </div>

            <!-- Departemen -->
            <div class="col-md-6">
              <div class="datagrid-item">
                <div class="datagrid-title">Departemen</div>
                <div class="datagrid-content">{{ pegawai.departemen?.nama }}</div>
              </div>
            </div>

            <!-- Status Kontrak -->
            <div class="col-md-6">
              <div class="datagrid-item">
                <div class="datagrid-title">Status Kontrak</div>
                <div class="datagrid-content">{{ pegawai.status_kontrak }}</div>
              </div>
            </div>

            <!-- Status -->
            <div class="col-md-6">
              <div class="datagrid-item">
                <div class="datagrid-title">Status Pegawai</div>
                <div class="datagrid-content">{{ pegawai.status }}</div>
              </div>
            </div>
          </div>
        </div>
        <div class="card-footer d-flex">
          <div class="ms-auto">
            <button class="btn btn-outline-primary" @click="goBack()">
              Kembali
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  title: "Detail Pegawai",
});

useSeoMeta({
  title: "Detail Pegawai",
});

const route = useRoute()
const nip = route.params.nipp
const token = useCookie('token')

const { data: response } = await useFetch(`/api/pegawai/${nip}`, {
  headers: { Authorization: `Bearer ${token.value}` }
})

if (!response.value?.data) {
  navigateTo('/pegawai')
}

const pegawai = computed(() => response.value?.data || {})

const { goBack } = useGoBack();
</script>

<style scoped>
.foto-ptofil {
  width: 100px;
  height: 100px;
  border-radius: 50%;
}
</style>
