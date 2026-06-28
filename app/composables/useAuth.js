export const useAuth = () => {
    // State global untuk menyimpan data user dan permissions (role_permission)
    const userPermissions = useState('userPermissions', () => null);

    // Fungsi untuk mengambil data permissions berdasarkan id_role
    const fetchPermissions = async (idRole) => {
        try {
            const res = await $fetch(`/api/user/role/${idRole}`);
            if (res.data && res.data.permission) {
                userPermissions.value = res.data.permission;
            }
        } catch (error) {
            console.error('Gagal mengambil permissions:', error);
            userPermissions.value = null;
        }
    };

    // Fungsi untuk mengecek apakah user punya akses ke modul tertentu
    // Mengembalikan true jika akses == 1
    const hasAccess = (modulFitur) => {
        if (!userPermissions.value) return false;
        const perm = userPermissions.value.find(p => p.modul_fitur === modulFitur);
        return perm ? perm.akses === 1 : false;
    };

    return {
        userPermissions,
        fetchPermissions,
        hasAccess
    };
};
