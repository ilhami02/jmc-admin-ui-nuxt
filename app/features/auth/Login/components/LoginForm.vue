<template>
  <form @submit.prevent="handleLogin">
    <!-- Username -->
    <div class="mb-2">
      <input
        type="text"
        v-model.trim="username"
        class="form-control py-3 border-0 bg-light text-dark"
        placeholder="Username / Email / No. HP"
        name="username"
        required
      />
    </div>

    <!-- Password -->
    <div class="mb-2">
      <input
        type="password"
        v-model="password"
        class="form-control py-3 border-0 bg-light text-dark"
        name="password"
        placeholder="Password"
        required
      />
    </div>

    <!-- Custom Captcha -->
    <div class="mb-3">
      <label class="form-label text-start d-block">Kode Captcha</label>
      <div class="d-flex align-items-center gap-2 mb-2">
        <!-- Canvas untuk merender gambar teks acak -->
        <canvas ref="captchaCanvas" width="150" height="50" class="border rounded bg-white shadow-sm" style="cursor: pointer;" @click="generateCaptcha" title="Klik untuk mengubah kode"></canvas>
        <button type="button" class="btn btn-icon btn-light border" @click="generateCaptcha" title="Refresh Captcha">
          <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-refresh" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4" /><path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4" /></svg>
        </button>
      </div>
      <input
        type="text"
        v-model="inputCaptcha"
        class="form-control py-3 border-0 bg-light text-dark"
        placeholder="Ketik 6 karakter kode di atas"
        required
      />
    </div>

    <div class="mb-2 text-start">
      <label class="form-check cursor-pointer">
        <input type="checkbox" v-model="rememberMe" class="form-check-input" />
        <span class="form-check-label">Remember Me</span>
      </label>
    </div>

    <!-- Submit -->
    <div class="d-grid mt-4">
      <button class="btn btn-primary text-uppercase shadow py-3" type="submit">
        Masuk
      </button>
    </div>
  </form>
</template>

<script setup>
import { ref, onMounted } from 'vue';
const config = useRuntimeConfig();

const username = ref('');
const password = ref('');
const rememberMe = ref(false);
const inputCaptcha = ref('');

// Captcha states
const captchaText = ref('');
const captchaCanvas = ref(null);

const router = useRouter();
const tokenCookie = useCookie('token');
const rememberCookie = useCookie('rememberMe');
const { fetchPermissions } = useAuth();

// Generate Random String for Captcha
const generateRandomString = (length) => {
  // Hilangkan karakter yang mirip (I, l, 1, O, 0) agar tidak membingungkan
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Render Captcha on Canvas
const generateCaptcha = () => {
  captchaText.value = generateRandomString(6);
  if (!captchaCanvas.value) return;

  const ctx = captchaCanvas.value.getContext('2d');
  const width = captchaCanvas.value.width;
  const height = captchaCanvas.value.height;

  // Background
  ctx.fillStyle = '#f8f9fa';
  ctx.fillRect(0, 0, width, height);

  // Add some noise (lines)
  for (let i = 0; i < 7; i++) {
    ctx.strokeStyle = `rgba(${Math.random()*150},${Math.random()*150},${Math.random()*150},0.5)`;
    ctx.beginPath();
    ctx.moveTo(Math.random() * width, Math.random() * height);
    ctx.lineTo(Math.random() * width, Math.random() * height);
    ctx.stroke();
  }

  // Draw Text
  ctx.font = 'bold 24px monospace';
  ctx.fillStyle = '#206bc4'; // Tabler primary color
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Draw each character with slight random rotation
  for (let i = 0; i < captchaText.value.length; i++) {
    ctx.save();
    ctx.translate(20 + i * 22, height / 2);
    const angle = (Math.random() - 0.5) * 0.5; // Rotate slightly
    ctx.rotate(angle);
    ctx.fillText(captchaText.value[i], 0, 0);
    ctx.restore();
  }
};

onMounted(() => {
  // Delay sedikit agar memastikan DOM/Canvas sudah siap dirender
  setTimeout(() => {
    generateCaptcha();
  }, 100);
});

const handleLogin = async () => {
  if (inputCaptcha.value.toLowerCase() !== captchaText.value.toLowerCase()) {
    alert('Kode Captcha tidak cocok!');
    inputCaptcha.value = '';
    generateCaptcha(); // Refresh captcha
    return;
  }

  try {
    const res = await $fetch('/api/auth/login', {
      method: 'POST',
      body: { username: username.value, password: password.value }
    });

    if (res.status === 'success' && res.data.token) {
      tokenCookie.value = res.data.token;
      rememberCookie.value = rememberMe.value ? 'true' : 'false';
      
      // Ambil id_role dari payload token (index 1 dari jwt string)
      const payload = JSON.parse(atob(res.data.token.split('.')[1]));
      
      // Fetch dan simpan permissions
      await fetchPermissions(payload.id_role);
      
      // Redirect ke beranda
      router.push('/');
    }
  } catch (error) {
    console.error(error);
    const msg = error?.data?.statusMessage || 'Login gagal, periksa kembali kredensial Anda.';
    alert(msg);
    // Refresh captcha on fail
    inputCaptcha.value = '';
    generateCaptcha();
  }
};
</script>
