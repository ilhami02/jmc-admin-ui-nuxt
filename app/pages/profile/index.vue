<template>
  <div class="page-wrapper">
    <div class="page-header d-print-none">
      <div class="container-xl">
        <div class="row g-2 align-items-center">
          <div class="col">
            <h2 class="page-title">
              My Profile
            </h2>
          </div>
        </div>
      </div>
    </div>
    
    <div class="page-body">
      <div class="container-xl">
        <div class="row row-cards">
          <div class="col-12 col-md-8 col-lg-6 mx-auto">
            <div class="card">
              <div class="card-header">
                <h3 class="card-title">Edit Profil Akun</h3>
              </div>
              <div class="card-body">
                <form @submit.prevent="updateProfile">
                  <div class="mb-3">
                    <label class="form-label required">Nama Lengkap</label>
                    <div>
                      <input type="text" class="form-control" v-model="form.nama" required placeholder="Masukkan nama lengkap">
                    </div>
                  </div>
                  
                  <div class="mb-3">
                    <label class="form-label required">Username</label>
                    <div>
                      <input type="text" class="form-control" v-model="form.username" required placeholder="Username untuk login">
                      <small class="form-hint">Jika Anda mengubah username, Anda mungkin diharuskan untuk login ulang.</small>
                    </div>
                  </div>

                  <div class="mb-3">
                    <label class="form-label">Email</label>
                    <div>
                      <input type="email" class="form-control" v-model="form.email" placeholder="Alamat email aktif">
                    </div>
                  </div>

                  <div class="mb-3">
                    <label class="form-label">Nomor HP</label>
                    <div>
                      <input type="text" class="form-control" :value="pegawaiInfo.nomor_hp" readonly disabled placeholder="-">
                      <small class="form-hint">Nomor HP dikelola dari menu Data Pegawai.</small>
                    </div>
                  </div>

                  <div class="mb-3">
                    <label class="form-label">Role Akses</label>
                    <div>
                      <input type="text" class="form-control" :value="roleName" readonly disabled>
                    </div>
                  </div>

                  <div class="form-footer">
                    <button type="submit" class="btn btn-primary w-100" :disabled="isSaving">
                      <span v-if="isSaving" class="spinner-border spinner-border-sm me-2" role="status"></span>
                      Simpan Perubahan
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const tokenCookie = useCookie('token')
const router = useRouter()

const form = ref({
  nama: '',
  username: '',
  email: ''
})

const pegawaiInfo = ref({
  nomor_hp: ''
})

const roleName = ref('')
const isSaving = ref(false)

const loadProfile = async () => {
  try {
    const { data } = await $fetch('/api/user/profile', {
      headers: {
        Authorization: `Bearer ${tokenCookie.value}`
      }
    })
    
    if (data) {
      form.value.nama = data.nama || ''
      form.value.username = data.username || ''
      form.value.email = data.email || ''
      
      roleName.value = data.role?.nama_role || '-'
      pegawaiInfo.value.nomor_hp = data.pegawai?.nomor_hp || '-'
    }
  } catch (error) {
    console.error('Gagal mengambil data profil:', error)
    alert('Gagal memuat profil. Silakan coba lagi.')
  }
}

onMounted(() => {
  loadProfile()
})

const updateProfile = async () => {
  isSaving.value = true
  try {
    const res = await $fetch('/api/user/profile', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${tokenCookie.value}`
      },
      body: form.value
    })
    
    alert('Profil berhasil diperbarui! Silakan login ulang untuk melihat perubahan nama di sudut layar.')
    
    // Paksa user login ulang untuk me-refresh JWT yang mengandung username & nama lama
    useCookie('token').value = null
    useCookie('userPermissions').value = null
    router.push('/login')
    
  } catch (error) {
    const errMsg = error.data?.statusMessage || 'Gagal memperbarui profil'
    alert(errMsg)
  } finally {
    isSaving.value = false
  }
}
</script>
