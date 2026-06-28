<template>
  <div>
    <div class="card mb-3">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-4 col-lg-3">
            <label for="" class="form-label">Nama Role</label>
            <input type="text" class="form-control" readonly disabled :value="roleData?.nama_role" />
          </div>
          <div class="col-md-4 col-lg-3">
            <label for="" class="form-label">Deskripsi</label>
            <input type="text" class="form-control" readonly disabled value="-" />
          </div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="table-responsive card-body p-0">
        <table class="table table-vcenter">
          <thead>
            <tr>
              <th width="5">No</th>
              <th>Modul/Fitur</th>
              <th class="text-center">Akses</th>
              <th class="text-center">Create</th>
              <th>Read</th>
              <th>Update</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody v-for="(item, index) in hakAkses" :key="item.id">
            <tr>
              <td class="text-center">{{ index + 1 }}</td>
              <td>{{ item.modul_fitur }}</td>
              <td class="text-center">
                <IconCircleCheckFilled v-if="item.akses === 1" class="text-green" />
                <IconXboxXFilled v-else class="text-red" />
              </td>
              <td class="text-center">
                <IconCircleCheckFilled v-if="item.create === 1" class="text-green" />
                <IconXboxXFilled v-else class="text-red" />
              </td>
              <td>{{ item.read }}</td>
              <td>{{ item.update }}</td>
              <td>{{ item.delete }}</td>
            </tr>
          </tbody>
          <tbody v-if="pending">
            <tr><td colspan="7" class="text-center py-3">Memuat data...</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  title: "Hak Akses",
});

useSeoMeta({
  title: "Hak Akses",
});

import { IconCircleCheckFilled, IconXboxXFilled } from "@tabler/icons-vue";
import { useRoute } from 'vue-router';

const route = useRoute();
const token = useCookie('token');
const idRole = route.params.id;

// Ambil data detail role beserta permission
const { data: response, pending } = await useFetch(`/api/user/role/${idRole}`, {
  headers: { Authorization: `Bearer ${token.value}` }
});

const roleData = computed(() => response.value?.data || {});
const hakAkses = computed(() => roleData.value?.permission || []);
</script>
