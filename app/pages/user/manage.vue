<template>
  <NuxtLayout name="default">
    <template #actions>
      <button
        class="btn btn-primary"
        data-bs-toggle="modal"
        data-bs-target="#modal-add"
        @click="openAdd"
      >
        <IconPlus stroke="{3}" size="20" />Tambah
      </button>
    </template>
    <div class="card">
      <div class="card-header">
        <div class="d-flex gap-2 ms-auto">
          <!-- Filter Role -->
          <select name="" id="" class="form-select">
            <template v-for="(item, index) in roleOptions" :key="index">
              <option :value="item.value">{{ item.label }}</option>
            </template>
          </select>

          <!-- Search -->
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
              <th width="15">Action</th>
              <th @click="handleSort('nama')" style="cursor:pointer">Nama Pengguna <IconChevronUp v-if="sortBy==='nama' && sortOrder==='asc'" size="14"/><IconChevronDown v-if="sortBy==='nama' && sortOrder==='desc'" size="14"/></th>
              <th @click="handleSort('username')" style="cursor:pointer">Username <IconChevronUp v-if="sortBy==='username' && sortOrder==='asc'" size="14"/><IconChevronDown v-if="sortBy==='username' && sortOrder==='desc'" size="14"/></th>
              <th>Jabatan</th>
              <th>Departemen</th>
              <th>Role</th>
              <th @click="handleSort('status')" style="cursor:pointer">Status <IconChevronUp v-if="sortBy==='status' && sortOrder==='asc'" size="14"/><IconChevronDown v-if="sortBy==='status' && sortOrder==='desc'" size="14"/></th>
            </tr>
          </thead>
          <tbody v-for="(item, index) in listUser" :key="item.id">
            <tr>
              <td class="text-center">{{ index + 1 }}</td>
              <td class="text-nowrap">
                <div class="d-flex">
                  <a href="#" class="text-dark" data-bs-toggle="modal" data-bs-target="#modal-add" @click="openEdit(item)">
                    <span data-bs-toggle="tooltip" data-bs-placement="bottom" title="Edit">
                      <IconPencil stroke="{1}" size="20" />
                    </span>
                  </a>
                  <a
                    v-if="!currentUser || currentUser.id !== item.id"
                    href="#" class="text-danger"
                    data-bs-toggle="modal" data-bs-target="#modal-hapus"
                    @click="openDelete(item.id)"
                  >
                    <span data-bs-toggle="tooltip" data-bs-placement="bottom" title="Hapus">
                      <IconTrash stroke="{1}" size="20" />
                    </span>
                  </a>
                </div>
              </td>
              <td>{{ item.nama }}</td>
              <td>{{ item.username }}</td>
              <td>{{ item.pegawai?.jabatan?.nama || '-' }}</td>
              <td>{{ item.pegawai?.departemen?.nama || '-' }}</td>
              <td>{{ item.role?.nama_role || '-' }}</td>
              <td>
                <IconCheck v-if="item.disabled === 0" stroke="2" class="text-success" />
                <IconX v-else stroke="2" class="text-danger" />
              </td>
            </tr>
          </tbody>
          <tbody v-if="pending">
            <tr><td colspan="8" class="text-center py-3">Memuat data...</td></tr>
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

      <div class="modal modal-blur fade" id="modal-add">
        <div class="modal-dialog modal-dialog-centered" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">{{ isEdit ? 'Edit User' : 'Form Manajemen User' }}</h5>
              <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                id="closeModalBtn"
              ></button>
            </div>
            <div class="modal-body">

              <div class="mb-3" style="position: relative;">
                <label class="form-label required">Nama Pengguna</label>
                <input
                  type="text"
                  class="form-control"
                  v-model="namaSearch"
                  @input="onNamaInput"
                  @blur="onNamaBlur"
                  placeholder="Ketik minimal 2 huruf untuk mencari..."
                  :disabled="isEdit"
                />
                <small v-if="namaError" class="text-danger">{{ namaError }}</small>

                <ul
                  v-if="showSuggestions && suggestions.length > 0"
                  class="list-group"
                  style="position: absolute; z-index: 1000; width: 100%; max-height: 200px; overflow-y: auto; box-shadow: 0 4px 12px rgba(0,0,0,0.15); background-color: #ffffff;"
                >
                  <li
                    v-for="s in suggestions"
                    :key="s.id"
                    class="list-group-item list-group-item-action"
                    style="cursor: pointer;"
                    @mousedown.prevent="selectPegawai(s)"
                  >
                    <div>
                      <strong>{{ s.nama_pegawai }}</strong>
                    </div>
                    <small class="text-muted">
                      {{ s.jabatan?.nama || '-' }} · {{ s.departemen?.nama || '-' }}
                    </small>
                  </li>
                </ul>
              </div>

              <div class="mb-3">
                <label class="form-label required">Username</label>
                <input
                  type="text"
                  class="form-control"
                  v-model="formData.username"
                  @keyup="onUsernameKeyup"
                  placeholder="Minimal 6 karakter, huruf kecil & angka"
                  :class="{ 'is-invalid': usernameError, 'is-valid': usernameValid }"
                />
                <small v-if="usernameError" class="text-danger">{{ usernameError }}</small>
                <small v-else-if="usernameValid" class="text-success">Username tersedia</small>
              </div>

              <div class="mb-3">
                <label class="form-label required">Password</label>
                <div class="input-group">
                  <input
                    :type="showPassword ? 'text' : 'password'"
                    class="form-control"
                    v-model="formData.password"
                    @keyup="onPasswordKeyup"
                    :placeholder="isEdit ? 'Kosongkan jika tidak ingin mengubah password' : 'Generate atau ketik manual'"
                    :class="{ 'is-invalid': passwordError, 'is-valid': passwordValid }"
                  />
                  <button class="btn btn-outline-secondary" type="button" @click="showPassword = !showPassword">
                    <IconEye v-if="showPassword" size="18" />
                    <IconEyeOff v-else size="18" />
                  </button>
                </div>
                <!-- Pesan validasi password -->
                <small v-if="passwordError" class="text-danger">{{ passwordError }}</small>
                <small v-else-if="passwordValid" class="text-success">Password memenuhi aturan</small>
                <div class="mt-1">
                  <button class="btn btn-outline-primary btn-sm" type="button" @click="generatePassword">
                    <IconRefresh size="16" class="me-1" />
                    Generate Password
                  </button>
                </div>
              </div>

              <div class="mb-3" style="position: relative;">
                <label class="form-label required">Jabatan</label>
                <input
                  type="text"
                  class="form-control"
                  v-model="jabatanSearch"
                  @focus="showJabatanDropdown = true"
                  @blur="onJabatanBlur"
                  placeholder="Cari dan pilih jabatan..."
                  autocomplete="off"
                />
                <ul
                  v-if="showJabatanDropdown"
                  class="list-group"
                  style="position: absolute; z-index: 1000; width: 100%; max-height: 200px; overflow-y: auto; box-shadow: 0 4px 12px rgba(0,0,0,0.15); background-color: #ffffff;"
                >
                  <li
                    v-for="j in filteredJabatan"
                    :key="j.id"
                    class="list-group-item list-group-item-action"
                    style="cursor: pointer;"
                    @mousedown.prevent="selectJabatan(j)"
                  >
                    {{ j.nama }}
                  </li>
                  <li v-if="filteredJabatan.length === 0" class="list-group-item text-muted">
                    Tidak ada data
                  </li>
                </ul>
              </div>

              <div class="mb-3" style="position: relative;">
                <label class="form-label required">Departemen</label>
                <input
                  type="text"
                  class="form-control"
                  v-model="departemenSearch"
                  @focus="showDepartemenDropdown = true"
                  @blur="onDepartemenBlur"
                  placeholder="Cari dan pilih departemen..."
                  autocomplete="off"
                />
                <ul
                  v-if="showDepartemenDropdown"
                  class="list-group"
                  style="position: absolute; z-index: 1000; width: 100%; max-height: 200px; overflow-y: auto; box-shadow: 0 4px 12px rgba(0,0,0,0.15); background-color: #ffffff;"
                >
                  <li
                    v-for="d in filteredDepartemen"
                    :key="d.id"
                    class="list-group-item list-group-item-action"
                    style="cursor: pointer;"
                    @mousedown.prevent="selectDepartemen(d)"
                  >
                    {{ d.nama }}
                  </li>
                  <li v-if="filteredDepartemen.length === 0" class="list-group-item text-muted">
                    Tidak ada data
                  </li>
                </ul>
              </div>

              <div class="mb-3">
                <label class="form-label required">Role</label>
                <select class="form-select" v-model="formData.id_role">
                  <option value="" selected disabled>
                    Pilih terlebih dahulu
                  </option>
                  <option v-for="r in listRole" :key="r.id" :value="r.id">{{ r.nama_role }}</option>
                </select>
              </div>

              <div>
                <label class="form-label">Status</label>
                <label class="form-check">
                  <input class="form-check-input" type="checkbox" v-model="isActive" />
                  <span class="form-check-label">Aktif</span>
                </label>
              </div>
            </div>
            <div class="modal-footer">
              <div class="d-flex gap-2 ms-auto">
                <button type="button" class="btn" data-bs-dismiss="modal">
                  Kembali
                </button>
                <button type="button" class="btn btn-primary" @click="submitForm" :disabled="isSaving || !isFormValid">
                  <i class="ti ti-check me-1"></i> {{ isSaving ? 'Menyimpan...' : 'Simpan' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

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
              id="closeDeleteModalBtn"
            ></button>
            <div class="modal-status bg-danger"></div>
            <div class="modal-body text-center py-4">
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
                      @click="submitDelete"
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

<script setup>

definePageMeta({
  title: "Manajemen User",
  layout: false,
});

useSeoMeta({
  title: "Manajemen User",
});

import { 
  IconPencil, 
  IconPlus, 
  IconSearch, 
  IconTrash, 
  IconEye, 
  IconEyeOff, 
  IconRefresh,
  IconCheck,
  IconX,
  IconChevronUp,
  IconChevronDown
} from "@tabler/icons-vue";
import { ref, computed, watch } from 'vue';

const currentUser = ref(null);

if (import.meta.client) {
  try {
    const tokenCookie = useCookie('token');
    if (tokenCookie.value) {
      // Ambil bagian payload (index 1) dari JWT
      const payload = tokenCookie.value.split('.')[1];
      // Decode Base64 → JSON string → JavaScript object
      currentUser.value = JSON.parse(atob(payload));
    }
  } catch (e) {
    // Jika token tidak valid/expired, biarkan currentUser = null
    console.warn('Gagal decode token:', e);
  }
}

const currentPage = ref(1);
const limit = ref(10);

const { data: resUser, pending, refresh } = await useFetch('/api/user', {
  query: {
    page: currentPage,
    limit: limit
  },
  watch: [currentPage]
});

const meta = computed(() => resUser.value?.meta || { totalPages: 1, page: 1, total: 0 });

const changePage = (page) => {
  if (page >= 1 && page <= meta.value.totalPages) {
    currentPage.value = page;
  }
};
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

const listUser = computed(() => {
  let data = resUser.value?.data || [];
  if (data.length > 0) {
    data = [...data].sort((a, b) => {
      let valA, valB;
      if (sortBy.value === 'nama') {
        valA = a.nama.toLowerCase();
        valB = b.nama.toLowerCase();
      } else if (sortBy.value === 'username') {
        valA = a.username.toLowerCase();
        valB = b.username.toLowerCase();
      } else if (sortBy.value === 'status') {
        valA = a.disabled;
        valB = b.disabled;
      }
      
      if (valA < valB) return sortOrder.value === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder.value === 'asc' ? 1 : -1;
      return 0;
    });
  }
  return data;
});

// Fetch semua role (untuk dropdown Role dan filter tabel)
const { data: resRole } = await useFetch('/api/user/role');
const listRole = computed(() => resRole.value?.data || []);

// Fetch semua jabatan (tipe = "Jabatan" dari tabel master_data)
const { data: resJabatan } = await useFetch('/api/master-data?tipe=Jabatan');
const listJabatan = computed(() => resJabatan.value?.data || []);

// Fetch semua departemen
const { data: resDept } = await useFetch('/api/master-data?tipe=Departemen');
const listDepartemen = computed(() => resDept.value?.data || []);

// Options untuk filter role di tabel (termasuk "Semua Role")
const roleOptions = computed(() => [
  { label: "Semua Role", value: "" },
  ...listRole.value.map(r => ({ label: r.nama_role, value: r.id }))
]);


const isEdit = ref(false);           // true = mode edit, false = mode tambah
const isSaving = ref(false);         // true saat sedang proses submit (disable tombol)
const isActive = ref(true);          // status aktif/nonaktif (checkbox)
const selectedId = ref(null);        // ID user yang sedang diedit/dihapus
const showPassword = ref(false);     // toggle tampilan password (text/password)

// formData → object yang menyimpan semua value form
const formData = ref({
  nama: '',
  username: '',
  id_jabatan: '',
  id_departemen: '',
  id_role: '',
  id_pegawai: '',
  password: '',
});

const namaSearch = ref('');          // Teks yang diketik user di input nama
const suggestions = ref([]);         // Array hasil pencarian pegawai
const showSuggestions = ref(false);  // Flag untuk tampilkan/sembunyikan dropdown
const namaError = ref('');           // Pesan error untuk field nama
let searchTimeout = null;            // Timer untuk debounce (dijelaskan di bawah)

const onNamaInput = () => {
  namaError.value = '';
  // Reset id_pegawai karena user sedang mengetik ulang (belum pilih)
  formData.value.id_pegawai = '';
  formData.value.nama = '';

  // clearTimeout → batalkan timer sebelumnya
  if (searchTimeout) clearTimeout(searchTimeout);

  const q = namaSearch.value.trim();
  if (q.length < 2) {
    // Kurang dari 2 karakter → sembunyikan dropdown
    suggestions.value = [];
    showSuggestions.value = false;
    return;
  }

  // setTimeout → set timer baru, fetch setelah 300ms
  searchTimeout = setTimeout(async () => {
    try {
      // $fetch → fungsi Nuxt untuk HTTP request (mirip axios)
      const res = await $fetch(`/api/pegawai/search?q=${encodeURIComponent(q)}`);
      suggestions.value = res.data || [];
      showSuggestions.value = true;
    } catch (e) {
      console.error('Error searching pegawai:', e);
      suggestions.value = [];
    }
  }, 300);
};

const selectPegawai = (s) => {
  namaSearch.value = s.nama_pegawai;
  formData.value.nama = s.nama_pegawai;
  formData.value.id_pegawai = s.id;

  // Auto-fill jabatan dan departemen dari data pegawai yang dipilih
  if (s.jabatan) {
    formData.value.id_jabatan = s.jabatan.id;
    jabatanSearch.value = s.jabatan.nama;
  }
  if (s.departemen) {
    formData.value.id_departemen = s.departemen.id;
    departemenSearch.value = s.departemen.nama;
  }

  showSuggestions.value = false;
  namaError.value = '';
};

const onNamaBlur = () => {
  setTimeout(() => {
    showSuggestions.value = false;
    // Jika user ketik tapi tidak pilih dari suggestion → tampilkan error
    if (namaSearch.value && !formData.value.id_pegawai) {
      namaError.value = 'Pilih nama dari daftar suggestion';
    }
  }, 200);
};

const usernameError = ref('');       // Pesan error
const usernameValid = ref(false);    // true jika username valid & tersedia
let usernameTimeout = null;          // Timer debounce untuk cek keunikan

const onUsernameKeyup = () => {
  usernameError.value = '';
  usernameValid.value = false;

  const val = formData.value.username;

  // Aturan 1: Minimal 6 karakter
  if (val.length > 0 && val.length < 6) {
    usernameError.value = 'Username minimal 6 karakter';
    return;
  }

  // Aturan 2: Tidak boleh ada spasi
  if (/\s/.test(val)) {
    usernameError.value = 'Username tidak boleh mengandung spasi';
    return;
  }

  // Aturan 3 & 4: Hanya huruf kecil dan angka
  // Regex /^[a-z0-9]+$/ artinya:
  // ^ = awal string, [a-z0-9] = huruf kecil atau angka, + = satu atau lebih, $ = akhir string
  if (val.length > 0 && !/^[a-z0-9]+$/.test(val)) {
    usernameError.value = 'Username hanya boleh huruf kecil dan angka';
    return;
  }

  if (val.length === 0) return;

  // Aturan 5: Cek keunikan (dengan debounce 500ms)
  if (usernameTimeout) clearTimeout(usernameTimeout);
  usernameTimeout = setTimeout(async () => {
    try {
      // Bangun URL untuk cek keunikan
      // excludeId hanya ditambahkan saat mode edit (agar username sendiri tidak dianggap duplikat)
      let url = `/api/user/check-username?username=${encodeURIComponent(val)}`;
      if (isEdit.value && selectedId.value) {
        url += `&excludeId=${selectedId.value}`;
      }

      const res = await $fetch(url);
      if (res.available) {
        usernameValid.value = true;
      } else {
        usernameError.value = 'Username sudah digunakan';
      }
    } catch (e) {
      console.error('Error checking username:', e);
    }
  }, 500);
};

const passwordError = ref('');
const passwordValid = ref(false);

const validatePassword = (val) => {
  passwordError.value = '';
  passwordValid.value = false;

  if (!val || val.length === 0) return;

  if (val.length < 8) {
    passwordError.value = 'Password minimal 8 karakter';
    return;
  }
  if (/\s/.test(val)) {
    passwordError.value = 'Password tidak boleh mengandung spasi';
    return;
  }
  // /[A-Z]/ → cek apakah ada minimal 1 huruf besar
  if (!/[A-Z]/.test(val)) {
    passwordError.value = 'Password harus ada minimal 1 huruf besar';
    return;
  }
  // /[a-z]/ → cek apakah ada minimal 1 huruf kecil
  if (!/[a-z]/.test(val)) {
    passwordError.value = 'Password harus ada minimal 1 huruf kecil';
    return;
  }
  // /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/ → cek karakter khusus
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(val)) {
    passwordError.value = 'Password harus ada minimal 1 karakter khusus';
    return;
  }

  // Semua aturan terpenuhi!
  passwordValid.value = true;
};

const onPasswordKeyup = () => {
  validatePassword(formData.value.password);
};

const generatePassword = () => {
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const digits = '0123456789';
  const special = '!@#$%^&*()_+-=';
  const all = lower + upper + digits + special;

  // Fungsi helper: ambil 1 karakter acak dari string
  const getRandom = (chars) => chars[Math.floor(Math.random() * chars.length)];

  let password = '';
  password += getRandom(lower);    // 1 huruf kecil
  password += getRandom(upper);    // 1 huruf besar
  password += getRandom(digits);   // 1 angka
  password += getRandom(special);  // 1 karakter khusus

  for (let i = password.length; i < 12; i++) {
    password += getRandom(all);
  }

  const arr = password.split('');
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    // Tukar posisi arr[i] dengan arr[j]
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  password = arr.join('');

  formData.value.password = password;
  showPassword.value = true;  // Tampilkan password yang di-generate agar user bisa lihat/copy
  validatePassword(password);  // Jalankan validasi (harusnya selalu valid)
};

const jabatanSearch = ref('');
const showJabatanDropdown = ref(false);

const filteredJabatan = computed(() => {
  const q = jabatanSearch.value.toLowerCase().trim();
  if (!q) return listJabatan.value;
  return listJabatan.value.filter(j =>
    j.nama?.toLowerCase().includes(q)
  );
});

const selectJabatan = (j) => {
  formData.value.id_jabatan = j.id;
  jabatanSearch.value = j.nama;
  showJabatanDropdown.value = false;
};

const onJabatanBlur = () => {
  setTimeout(() => {
    showJabatanDropdown.value = false;
  }, 200);
};

const departemenSearch = ref('');
const showDepartemenDropdown = ref(false);

const filteredDepartemen = computed(() => {
  const q = departemenSearch.value.toLowerCase().trim();
  if (!q) return listDepartemen.value;
  return listDepartemen.value.filter(d =>
    d.nama?.toLowerCase().includes(q)
  );
});

const selectDepartemen = (d) => {
  formData.value.id_departemen = d.id;
  departemenSearch.value = d.nama;
  showDepartemenDropdown.value = false;
};

const onDepartemenBlur = () => {
  setTimeout(() => {
    showDepartemenDropdown.value = false;
  }, 200);
};

const isFormValid = computed(() => {
  // Semua field wajib harus terisi
  if (!formData.value.nama) return false;
  if (!formData.value.username) return false;
  if (!formData.value.id_jabatan) return false;
  if (!formData.value.id_departemen) return false;
  if (!formData.value.id_role) return false;
  if (!formData.value.id_pegawai) return false;

  // Jika ada error validasi → form tidak valid
  if (usernameError.value) return false;
  if (namaError.value) return false;

  // Saat mode tambah, password wajib diisi dan harus valid
  if (!isEdit.value) {
    if (!formData.value.password) return false;
    if (passwordError.value) return false;
  }

  return true;
});

const openAdd = () => {
  isEdit.value = false;
  selectedId.value = null;
  formData.value = {
    nama: '', username: '', id_jabatan: '', id_departemen: '',
    id_role: '', id_pegawai: '', password: ''
  };
  isActive.value = true;        // Default: status aktif (sesuai ketentuan)
  namaSearch.value = '';
  jabatanSearch.value = '';
  departemenSearch.value = '';
  suggestions.value = [];
  namaError.value = '';
  usernameError.value = '';
  usernameValid.value = false;
  passwordError.value = '';
  passwordValid.value = false;
  showPassword.value = false;
};

const openEdit = (item) => {
  isEdit.value = true;
  selectedId.value = item.id;

  // Isi formData dengan data user yang ada
  formData.value.nama = item.nama || '';
  formData.value.username = item.username || '';
  formData.value.id_role = item.id_role || '';
  formData.value.id_pegawai = item.id_pegawai || '';
  formData.value.id_jabatan = item.pegawai?.id_jabatan || '';
  formData.value.id_departemen = item.pegawai?.id_departemen || '';
  formData.value.password = '';  // Kosongkan, karena password tidak ditampilkan saat edit

  // Isi juga field-field pencarian (search input) dengan data yang ada
  namaSearch.value = item.nama || '';
  jabatanSearch.value = item.pegawai?.jabatan?.nama || '';
  departemenSearch.value = item.pegawai?.departemen?.nama || '';

  // Status: disabled = 0 artinya aktif, disabled = 1 artinya nonaktif
  isActive.value = item.disabled === 0;

  // Reset state validasi
  namaError.value = '';
  usernameError.value = '';
  usernameValid.value = false;
  passwordError.value = '';
  passwordValid.value = false;
};

const openDelete = (id) => {
  selectedId.value = id;
};

const submitForm = async () => {
  isSaving.value = true;
  try {
    const payload = {
      ...formData.value,   // Spread operator: copy semua property dari formData
      disabled: isActive.value ? 0 : 1  // Konversi checkbox ke angka
    };

    const url = isEdit.value ? `/api/user/${selectedId.value}` : '/api/user/create';
    const method = isEdit.value ? 'PUT' : 'POST';

    await $fetch(url, {
      method,
      body: payload,
    });

    alert(`User berhasil ${isEdit.value ? 'diperbarui' : 'ditambahkan'}!`);
    document.getElementById('closeModalBtn').click(); // Tutup modal programatically
    refresh(); // Refresh tabel agar data terbaru tampil
  } catch (error) {
    console.error(error);
    // Tampilkan pesan error dari API jika ada
    const msg = error?.data?.statusMessage || 'Terjadi kesalahan saat menyimpan user.';
    alert(msg);
  } finally {
    // "finally" selalu dijalankan, baik berhasil maupun gagal
    isSaving.value = false;
  }
};

const submitDelete = async () => {
  // Proteksi tambahan di frontend sebelum kirim request
  if (currentUser.value && currentUser.value.id === selectedId.value) {
    alert('Anda tidak dapat menghapus akun Anda sendiri.');
    return;
  }

  try {
    await $fetch(`/api/user/${selectedId.value}`, {
      method: 'DELETE',
    });
    alert('User berhasil dihapus!');
    document.getElementById('closeDeleteModalBtn').click();
    refresh();
  } catch (error) {
    console.error(error);
    // Tampilkan pesan error dari API (misal: "Anda tidak dapat menghapus akun Anda sendiri")
    const msg = error?.data?.statusMessage || 'Terjadi kesalahan saat menghapus user.';
    alert(msg);
  }
};
</script>
