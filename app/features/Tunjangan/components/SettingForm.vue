<template>
  <div class="card">
    <div class="card-body">
      <div class="row g-3">
        <!-- Tarif -->
        <div class="col-md-6">
          <label for="" class="form-label">Tarif (Rp)</label>
          <input type="number" min="0" class="form-control text-end" v-model="formData.tarif_per_km" />
        </div>

        <!-- Berlaku Mulai -->
        <div class="col-md-6">
          <label for="" class="form-label">Berlaku Mulai</label>
          <input type="date" class="form-control" v-model="formData.berlaku_mulai" />
        </div>

        <!-- Minimum Kilometer -->
        <div class="col-md-6">
          <label for="" class="form-label">Minimum Kilometer</label>
          <input type="number" min="0" class="form-control" v-model="formData.min_kilometer" />
        </div>

        <!-- Maksimum Kilometer -->
        <div class="col-md-6">
          <label for="" class="form-label">Maksimum Kilometer</label>
          <input type="number" min="0" class="form-control" v-model="formData.max_kilometer" />
        </div>
      </div>
    </div>
    <div class="card-footer">
      <div class="d-flex gap-2">
        <button class="btn btn-primary" @click="simpanSetting" :disabled="isLoading">
          {{ isLoading ? 'Menyimpan...' : 'Simpan' }}
        </button>
        <button class="btn btn-outline-primary" @click="goBack">Kembali</button>
      </div>
    </div>
  </div>
</template>

<script setup>
const formData = ref({ tarif_per_km: 0, berlaku_mulai: '', min_kilometer: 0, max_kilometer: 0 });
const isLoading = ref(false);

const loadSetting = async () => {
  const res = await $fetch('/api/tunjangan/setting');
  if (res.data) {
    formData.value = { ...res.data, berlaku_mulai: res.data.berlaku_mulai.split('T')[0] };
  }
};

const simpanSetting = async () => {
  isLoading.value = true;
  try {
    await $fetch('/api/tunjangan/setting', { method: 'POST', body: formData.value });
    alert("Setting berhasil disimpan!");
  } catch (e) { alert("Gagal simpan"); }
  finally { isLoading.value = false; }
};

onMounted(loadSetting);
</script>
