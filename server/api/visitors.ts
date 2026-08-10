// server/api/visitors.ts
import { BetaAnalyticsDataClient } from '@google-analytics/data';

export default defineEventHandler(async (event) => {
  const propertyId = '549081103'; 

  // Inisialisasi client dengan file JSON kredensial yang diunduh tadi
  const analyticsDataClient = new BetaAnalyticsDataClient({
    keyFilename: 'google-credentials.json',
  });

  try {
    // Meminta laporan pengguna aktif selama 7 hari terakhir
    const [response] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [
        {
          startDate: '7daysAgo',
          endDate: 'today',
        },
      ],
      metrics: [
        {
          name: 'activeUsers', // Menghitung pengunjung aktif
        },
      ],
    });

    // Mengambil nilai pengunjung dari respons Google
    const visitors = response.rows?.[0]?.metricValues?.[0]?.value || 0;

    return {
      status: 'success',
      data: {
        activeVisitors7Days: visitors
      }
    };

  } catch (error) {
    console.error("Error mengambil data GA4:", error);
    return {
      status: 'error',
      message: 'Gagal mengambil data analitik'
    };
  }
});