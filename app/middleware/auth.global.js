export default defineNuxtRouteMiddleware(async (to, from) => {
    if (to.path.startsWith('/login')) {
        return;
    }

    const tokenCookie = useCookie('token');
    
    // arahkan paksa ke halaman login jika tidak ada token
    if (!tokenCookie.value) {
        return navigateTo('/login');
    }

    // Ambil payload dari JWT token
    let payload;
    try {
        payload = JSON.parse(atob(tokenCookie.value.split('.')[1]));
    } catch (e) {
        // Jika token tidak valid, hapus dan ke login
        tokenCookie.value = null;
        return navigateTo('/login');
    }

    const { userPermissions, fetchPermissions, hasAccess } = useAuth();
    if (!userPermissions.value) {
        // Fetch izin dari backend
        await fetchPermissions(payload.id_role);
    }

    const routeMap = {
        '/': 'dashboard',
        '/pegawai': 'modul_pegawai',
        '/tunjangan/setting': 'setting_tunjangan_transport',
        '/tunjangan/transport': 'modul_tunjangan_transport',
        '/user/role': 'kelola_role',
        '/user/manage': 'kelola_user',
        '/log': 'modul_log'
    };

    let requiredModule = null;
    
    // Cocokkan rute (misal: /user/manage/create masuk ke kelola_user)
    for (const [path, moduleName] of Object.entries(routeMap)) {
        if (to.path === path || to.path.startsWith(path + '/')) {
            requiredModule = moduleName;
            break;
        }
    }

    // cek berdasarkan tabel permission
    if (requiredModule) {
        const isAllowed = hasAccess(requiredModule);
        if (!isAllowed) {
            if (to.path !== '/') {
                return navigateTo('/');
            } else {
                tokenCookie.value = null;
                return navigateTo('/login');
            }
        }
    }
});
