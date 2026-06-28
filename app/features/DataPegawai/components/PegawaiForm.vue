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
                    :src="previewFoto" 
                    alt="Preview" 
                    class="foto-ptofil" 
                  />
                  <label for="unggah-foto" class="form-label text-primary text-center cursor-pointer">Ubah Foto</label>
                  <input id="unggah-foto" type="file" hidden accept="image/png, image/jpeg" @change="handleUploadFoto" />
                </div>

                <div class="col">
                  <!-- NIP -->
                  <div class="mb-4">
                    <label for="" class="form-label">NIP</label>
                    <input type="number" min="0" class="form-control" v-model="formData.nip" />
                  </div>

                  <!-- Nama Lengkap -->
                  <div>
                    <label for="" class="form-label">Nama Lengkap</label>
                    <input type="text" class="form-control" v-model="formData.nama_pegawai"/>
                  </div>
                </div>
              </div>
            </div>

            <!-- Email -->
            <div class="col-md-6">
              <label for="" class="form-label">Email</label>
              <input type="email" class="form-control" placeholder="user@example.com" v-model="formData.email"/>
            </div>

            <!-- No HP -->
            <div class="col-md-6">
              <label for="" class="form-label">Nomor HP</label>
              <input type="text" class="form-control" placeholder="+6282218458888" v-model="formData.nomor_hp"/>
            </div>

            <!-- Tempat Lahir -->
            <div class="col-md-5">
              <label for="" class="form-label">Tempat Lahir</label>
              <input type="text" class="form-control" v-model="formData.tempat_lahir"/>
            </div>

            <!-- Tanggal Lahir -->
            <div class="col-md-5">
              <label for="" class="form-label">Tanggal Lahir</label>
              <input type="date" class="form-control" v-model="formData.tanggal_lahir"/>
            </div>

            <!-- Usia -->
            <div class="col-md-2">
              <label for="" class="form-label">Usia</label>
              <input type="number" min="0" class="form-control" readonly v-model="formData.usia"/>
            </div>

            <!-- Pendidikan -->
            <div class="col-12">
              <div class="card">
                <div class="card-body">
                  <label for="" class="form-label">Pendidikan</label>
                  <table class="table table-borderless align-middle">
                    <thead>
                      <tr>
                        <th class="py-0">Jenjang</th>
                        <th class="py-0">Nama Sekolah / Perguruan Tinggi</th>
                        <th class="py-0">Tahun Lulus</th>
                        <th class="py-0"></th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(edu, index) in formData.pendidikan" :key="index">
                        <td>
                          <input type="text" class="form-control" v-model="edu.tingkat_pendidikan" placeholder="Contoh: S1" />
                        </td>
                        <td>
                          <input type="text" class="form-control" v-model="edu.nama_sekolah" />
                        </td>
                        <td>
                          <input type="number" class="form-control" v-model="edu.tahun_lulus" />
                        </td>
                        <td>
                          <IconXboxXFilled class="text-red cursor-pointer" @click="hapusPendidikan(index)" />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <div class="text-center">
                    <button type="button" class="btn btn-primary" @click="tambahPendidikan">TAMBAH DATA</button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Alamat Lengkap -->
            <div class="col-12">
              <label for="" class="form-label">Alamat Lengkap</label>
              <textarea name="" id="" class="form-control" rows="3" v-model="formData.alamat_lengkap"></textarea>
            </div>

            <!-- Kecamatan -->
            <div class="col-md-4">
              <label class="form-label">Kecamatan</label>
              <input 
                type="text" 
                class="form-control" 
                v-model="kecamatanQuery" 
                @input="searchKecamatan" 
                placeholder="Ketik min 3 karakter..."
              />
              
              <ul v-if="showDropdown" class="dropdown-menu show w-100 mt-1">
                <li v-for="item in listKecamatan" :key="item.id" @click="selectKecamatan(item)">
                  <a class="dropdown-item cursor-pointer">{{ item.kecamatan }}</a>
                </li>
              </ul>
            </div>

            <!-- Kabupaten -->
            <div class="col-md-4">
              <label class="form-label">Kabupaten</label>
              <input type="text" class="form-control" v-model="selectedKabupaten" readonly />
            </div>

            <!-- Provinsi -->
            <div class="col-md-4">
              <label class="form-label">Provinsi</label>
              <input type="text" class="form-control" v-model="selectedProvinsi" readonly />
            </div>

            <!-- Jenis Kelamin -->
            <div class="col-md-12">
              <div class="form-label">Jenis Kelamin</div>
              <div>
                <label class="form-check form-check-inline">
                  <input
                    class="form-check-input"
                    type="radio"
                    name="jenisKelamin"
                    value="Pria"
                    v-model="formData.jenis_kelamin"
                  />
                  <span class="form-check-label">Pria</span>
                </label>
                <label class="form-check form-check-inline">
                  <input
                    class="form-check-input"
                    type="radio"
                    name="jenisKelamin"
                    value="Wanita"
                    v-model="formData.jenis_kelamin"
                  />
                  <span class="form-check-label">Wanita</span>
                </label>
              </div>
            </div>

            <!-- Status Pernikahan -->
            <div class="col-md-6">
              <div class="form-label">Status Pernikahan</div>
              <div>
                <label class="form-check">
                  <input
                    class="form-check-input"
                    type="radio"
                    name="radios"
                    checked=""
                    value="tidak_kawin"
                    v-model="formData.status_kawin"
                  />
                  <span class="form-check-label">Belum Menikah</span>
                </label>
                <label class="form-check">
                  <input class="form-check-input" type="radio" name="radios" value="Kawin" v-model="formData.status_kawin"/>
                  <span class="form-check-label">Menikah</span>
                </label>
              </div>
            </div>

            <!-- Jumlah Anak -->
            <div class="col-md-6">
              <label for="" class="form-label">Jumlah Anak</label>
              <input type="number" min="0" class="form-control" v-model="formData.jumlah_anak" :disabled="formData.status_kawin === 'tidak_kawin'" />
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
              <label for="" class="form-label">Tanggal Masuk</label>
              <input type="date" class="form-control" v-model="formData.tanggal_masuk"/>
            </div>

            <!-- Jabatan -->
            <div class="col-md-6">
              <label for="" class="form-label">Jabatan</label>
              <select name="" id="" class="form-select" v-model="formData.id_jabatan">
                <option value="" selected disabled>Pilih jabatan</option>
                <option value="1">Manager</option>
                <option value="2">Staf</option>
                <option value="3">Magang</option>
              </select>
            </div>

            <!-- Departemen -->
            <div class="col-md-6">
              <label for="" class="form-label">Departemen</label>
              <select name="" id="" class="form-select" v-model="formData.id_departemen">
                <option value="" selected disabled>Pilih departemen</option>
                <option value="4">Marketing</option>
                <option value="5">HRD</option>
                <option value="6">Production</option>
                <option value="7">Executive</option>
                <option value="8">Commissioner</option>
              </select>
            </div>

            <!-- Status Kontrak -->
            <div class="col-md-6">
              <label for="" class="form-label">Status Kontrak</label>
              <select name="" id="" class="form-select" v-model="formData.status_kontrak">
                <option value="PKWTT">PKWTT (Tetap)</option>
                <option value="PKWT">PKWT (Kontrak)</option>
              </select>
            </div>

            <!-- Status -->
            <div class="col-md-6">
              <label for="" class="form-label">Status Pegawai</label>
              <label class="form-check form-switch form-switch-3 mt-1">
                <input class="form-check-input" type="checkbox" checked="" true-value="Aktif" false-value="Nonaktif" v-model="formData.status" />
                <span class="form-check-label">Aktif</span>
              </label>
            </div>
          </div>
        </div>
        <div class="card-footer d-flex">
          <div class="d-flex gap-2 ms-auto">
            <button class="btn btn-primary" @click="submitData">Simpan</button>
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
import { IconXboxXFilled } from "@tabler/icons-vue";
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const { goBack } = useGoBack();
const route = useRoute();
const router = useRouter();
const token = useCookie('token');
const selectedProvinsi = ref("");
const selectedKabupaten = ref("");

// Prepare fields data
const formData = ref({
  nip: '',
  nama_pegawai: '',
  email: '',
  nomor_hp: '',
  tempat_lahir: '',
  tanggal_lahir: '',
  usia: 0,
  alamat_lengkap: '',
  id_kecamatan: '',
  id_jabatan: '',
  id_departemen: '',
  jenis_kelamin: 'Pria',
  status_kawin: 'tidak_kawin',
  jumlah_anak: 0,
  tanggal_masuk: '',
  status_kontrak: 'PKWTT',
  status: 'Aktif',
  pendidikan: [] // Array untuk form pendidikan yang dinamis
});

// add blank row in pendidikan
const tambahPendidikan = () => {
  formData.value.pendidikan.push({
    tingkat_pendidikan: '',
    nama_sekolah: '',
    tahun_lulus: ''
  });
};

const hapusPendidikan = (index) => {
  formData.value.pendidikan.splice(index, 1);
};

// untuk menyimpan foto
const fileFoto = ref(null);
const previewFoto = ref('/images/default-avatar.png');

// check edit or tambah
const isEdit = ref(false);
const paramId = route.params.nipp || route.params.id; // Sesuaikan dengan nama folder dinamis kamu

const loadDataPegawai = async () => {
  if (paramId) {
    isEdit.value = true;
    try {
      const response = await $fetch(`/api/pegawai/${paramId}`, {
        headers: { Authorization: `Bearer ${token.value}` }
      });
      if (response.data) {
        // Gabungkan data dari database ke dalam formData
        Object.assign(formData.value, response.data);
        
        // Format tanggal (YYYY-MM-DD)
        if (formData.value.tanggal_lahir) formData.value.tanggal_lahir = formData.value.tanggal_lahir.split('T')[0];
        if (formData.value.tanggal_masuk) formData.value.tanggal_masuk = formData.value.tanggal_masuk.split('T')[0];
        
        if (formData.value.foto_pegawai) previewFoto.value = formData.value.foto_pegawai;
      }
    } catch (error) {
      console.error("Gagal memuat data:", error);
    }
  }
};

onMounted(() => {
  loadDataPegawai();
});

// Handler upload photo
const handleUploadFoto = (event) => {
  const file = event.target.files[0];
  if (file) {
    fileFoto.value = file;
    // Buat URL sementara untuk preview gambar
    previewFoto.value = URL.createObjectURL(file);
  }
};

// POST for tambah, PUT for edit
const submitData = async () => {
  try {
    const payload = new FormData();
    
    for (const key in formData.value) {
      if (key !== 'pendidikan' && formData.value[key] !== null && formData.value[key] !== '') {
        payload.append(key, formData.value[key]);
      }
    }

    payload.append('pendidikan', JSON.stringify(formData.value.pendidikan));
    
    if (fileFoto.value) {
      payload.append('foto_pegawai', fileFoto.value);
    }

    const url = isEdit.value ? `/api/pegawai/${formData.value.id}` : '/api/pegawai/create';
    const method = isEdit.value ? 'PUT' : 'POST';

    await $fetch(url, {
      method: method,
      body: payload,
      // headers: {
      //   Authorization: `Bearer ${token.value}`
      // }
    });

    alert(`Data berhasil ${isEdit.value ? 'diubah' : 'ditambahkan'}!`);
    goBack(); // Kembali ke halaman daftar
  } catch (error) {
    console.error("Gagal menyimpan:", error);
    const msg = error?.data?.statusMessage || error?.message || "Terjadi kesalahan saat menyimpan data.";
    alert(msg);
  }
};

  // Autocomplete field kecamatan, kabupaten, provinsi
  const kecamatanQuery = ref(""); 
  const listKecamatan = ref([]);  
  const showDropdown = ref(false);

  // Watcher: jika id_kecamatan berubah (terpilih), isi otomatis kab & prov
  watch(() => formData.value.id_kecamatan, async (newVal) => {
    // if (newVal) {
    //   // const data = await $fetch(`/api/wilayah/detail/${newVal}`); // Buat endpoint detail jika perlu
    //   if (data) {
    //       selectedKabupaten.value = data.kabupaten;
    //       selectedProvinsi.value = data.provinsi;
    //   }
    // }
  });

  // Watcher: hitung usia otomatis saat tanggal_lahir diisi
  watch(() => formData.value.tanggal_lahir, (newVal) => {
    if (newVal) {
      const birthDate = new Date(newVal);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      formData.value.usia = age;
    } else {
      formData.value.usia = 0;
    }
  });

  // Watcher: reset jumlah anak jika status belum menikah
  watch(() => formData.value.status_kawin, (newVal) => {
    if (newVal === 'tidak_kawin') {
      formData.value.jumlah_anak = 0;
    }
  });

  // Fungsi pencarian
  const searchKecamatan = async () => {
    if (kecamatanQuery.value.length >= 3) {
      listKecamatan.value = await $fetch(`/api/wilayah/search?q=${kecamatanQuery.value}`);
      showDropdown.value = true;
    } else {
      listKecamatan.value = [];
    }
  };

  const selectKecamatan = (item) => {
    formData.value.id_kecamatan = item.id;
    kecamatanQuery.value = item.kecamatan;
    selectedKabupaten.value = item.kabupaten;
    selectedProvinsi.value = item.provinsi;
    showDropdown.value = false;
  };
</script>

<style scoped>
.foto-ptofil {
  width: 100px;
  height: 100px;
  border-radius: 50%;
}
</style>
