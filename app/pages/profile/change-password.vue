<template>
  <div class="page-wrapper">
    <div class="page-header d-print-none">
      <div class="container-xl">
        <div class="row g-2 align-items-center">
          <div class="col">
            <h2 class="page-title">
              Change Password
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
                <h3 class="card-title">Ganti Kata Sandi</h3>
              </div>
              <div class="card-body">
                <form @submit.prevent="changePassword">
                  
                  <div class="mb-3">
                    <label class="form-label required">Password Lama</label>
                    <div>
                      <input type="password" class="form-control" v-model="form.oldPassword" required placeholder="Masukkan password lama Anda">
                    </div>
                  </div>
                  
                  <div class="mb-3">
                    <label class="form-label required">Password Baru</label>
                    <div>
                      <input type="password" class="form-control" v-model="form.newPassword" @keyup="onPasswordKeyup" required placeholder="Masukkan password baru" :class="{ 'is-invalid': passwordError, 'is-valid': passwordValid }">
                      <small v-if="passwordError" class="text-danger">{{ passwordError }}</small>
                      <small v-else-if="passwordValid" class="text-success">Password memenuhi aturan</small>
                      <small v-else class="form-hint">Minimal 8 karakter, ada huruf besar, kecil, dan karakter khusus.</small>
                    </div>
                  </div>

                  <div class="mb-4">
                    <label class="form-label required">Konfirmasi Password Baru</label>
                    <div>
                      <input type="password" class="form-control" v-model="form.confirmPassword" required placeholder="Ketik ulang password baru">
                    </div>
                  </div>

                  <div class="form-footer">
                    <button type="submit" class="btn btn-primary w-100" :disabled="isSaving">
                      <span v-if="isSaving" class="spinner-border spinner-border-sm me-2" role="status"></span>
                      Perbarui Password
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
import { ref } from 'vue'

const tokenCookie = useCookie('token')

const form = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const passwordError = ref('')
const passwordValid = ref(false)
const isSaving = ref(false)

const onPasswordKeyup = () => {
  const val = form.value.newPassword
  passwordError.value = ''
  passwordValid.value = false

  if (!val || val.length === 0) return

  if (val.length < 8) {
    passwordError.value = 'Password minimal 8 karakter'
    return
  }
  if (/\s/.test(val)) {
    passwordError.value = 'Password tidak boleh mengandung spasi'
    return
  }
  if (!/[A-Z]/.test(val)) {
    passwordError.value = 'Password harus ada minimal 1 huruf besar'
    return
  }
  if (!/[a-z]/.test(val)) {
    passwordError.value = 'Password harus ada minimal 1 huruf kecil'
    return
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(val)) {
    passwordError.value = 'Password harus ada minimal 1 karakter khusus'
    return
  }

  passwordValid.value = true
}

const changePassword = async () => {
  // Validasi lokal
  if (!passwordValid.value) {
    alert('Password baru belum memenuhi kriteria keamanan!')
    return
  }
  if (form.value.newPassword !== form.value.confirmPassword) {
    alert('Konfirmasi password tidak cocok dengan password baru!')
    return
  }

  isSaving.value = true
  try {
    const res = await $fetch('/api/user/change-password', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${tokenCookie.value}`
      },
      body: {
        oldPassword: form.value.oldPassword,
        newPassword: form.value.newPassword
      }
    })
    
    alert('Password berhasil diperbarui!')
    
    // Kosongkan form setelah sukses
    form.value.oldPassword = ''
    form.value.newPassword = ''
    form.value.confirmPassword = ''
    passwordError.value = ''
    passwordValid.value = false
    
  } catch (error) {
    const errMsg = error.data?.statusMessage || 'Gagal memperbarui password'
    alert(errMsg)
  } finally {
    isSaving.value = false
  }
}
</script>
