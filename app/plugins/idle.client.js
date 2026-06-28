export default defineNuxtPlugin((nuxtApp) => {
    // Hanya berjalan di sisi klien
    if (import.meta.server) return;

    const IDLE_TIMEOUT = 3 * 60 * 1000; // 3 menit dalam milidetik
    let idleTimer = null;

    const resetTimer = () => {
        const token = useCookie('token');
        const rememberMe = useCookie('rememberMe');

        // Jika tidak login, atau Remember Me dicentang, abaikan idle timeout
        if (!token.value || rememberMe.value === 'true') {
            if (idleTimer) clearTimeout(idleTimer);
            return;
        }

        // Hapus timer lama
        if (idleTimer) clearTimeout(idleTimer);

        // Set timer baru
        idleTimer = setTimeout(() => {
            // Sesi habis karena idle
            alert('Sesi Anda telah berakhir karena tidak ada aktivitas selama 3 menit.');
            token.value = null;
            useCookie('userPermissions').value = null; // Optional clear
            // Arahkan ke halaman login
            navigateTo('/login');
        }, IDLE_TIMEOUT);
    };

    // Daftar event yang dianggap sebagai 'aktivitas' user
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];

    // Pasang listener ke window
    events.forEach(event => {
        window.addEventListener(event, resetTimer, true);
    });

    // Inisiasi timer pertama kali
    resetTimer();

    // Pastikan kita mengecek ulang jika rute berubah
    nuxtApp.hook('page:finish', () => {
        resetTimer();
    });
});
