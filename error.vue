<template>
  <div class="page page-center min-vh-100 d-flex align-items-center justify-content-center">
    <div class="container-tight py-4">
      <div class="empty">
        <div class="empty-header">404</div>
        <p class="empty-title">Oops… Halaman tidak ditemukan</p>
        <p class="empty-subtitle text-muted">
          Maaf, halaman yang Anda tuju ({{ error.url }}) tidak ada atau telah dipindahkan.
        </p>
        <div class="empty-action">
          <button @click="handleError" class="btn btn-primary">
            <svg xmlns="http://www.w3.org/2000/svg" class="icon" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><line x1="5" y1="12" x2="19" y2="12" /><line x1="5" y1="12" x2="11" y2="18" /><line x1="5" y1="12" x2="11" y2="6" /></svg>
            Kembali ke Beranda
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useHead } from '#imports'

const props = defineProps({
  error: Object
})

useHead({
  title: '404 - Halaman Tidak Ditemukan',
})

// Fungsi untuk menghapus status error dan kembali ke halaman utama
const handleError = () => clearError({ redirect: '/' })
</script>

<style scoped>
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}
.empty-header {
  font-size: 8rem;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 2rem;
  color: #206bc4;
}
.empty-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}
.empty-subtitle {
  font-size: 1rem;
  margin-bottom: 2rem;
  color: #6c7a91;
}
</style>
