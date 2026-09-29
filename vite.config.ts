import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
          adminLogin: path.resolve(__dirname, 'admin-login.html'),
          userLogin: path.resolve(__dirname, 'user-login.html'),
          register: path.resolve(__dirname, 'register.html'),
          adminDashboard: path.resolve(__dirname, 'admin-dashboard.html'),
          adminMapper: path.resolve(__dirname, 'admin-mapper.html'),
          manageAccidents: path.resolve(__dirname, 'manage-accidents.html'),
          hotspotAnalysis: path.resolve(__dirname, 'hotspot-analysis.html'),
          aiReport: path.resolve(__dirname, 'ai-report.html'),
          manageUsers: path.resolve(__dirname, 'manage-users.html'),
          userDashboard: path.resolve(__dirname, 'user-dashboard.html'),
          userMapper: path.resolve(__dirname, 'user-mapper.html'),
          statistics: path.resolve(__dirname, 'statistics.html'),
          safety: path.resolve(__dirname, 'safety.html'),
          about: path.resolve(__dirname, 'about.html'),
          contact: path.resolve(__dirname, 'contact.html'),
          adminTickets: path.resolve(__dirname, 'admin-tickets.html'),
          adminAccount: path.resolve(__dirname, 'admin-account.html'),
        }
      }
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
