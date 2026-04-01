// vite.config.js
export default {
    root: '.',
    base: '/',
    build: {
        outDir: 'dist',
        minify: 'terser',
        target: 'es2020',
    },
    server: {
        port: 3000,
        open: true,
    },
    preview: {
        port: 4173,
    },
};
