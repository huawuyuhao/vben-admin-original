import { defineConfig, viteCssLayerPlugin } from '@vben/vite-config';

export default defineConfig(async () => {
  return {
    application: {},
    vite: {
      plugins: [
        // element-plus 的 css 包进 @layer el，使 Tailwind 工具类可覆盖组件样式
        viteCssLayerPlugin({ layerName: 'el', packageName: 'element-plus' }),
      ],
      server: {
        proxy: {
          // Apifox Mock：/api/mock/auth/login → http://127.0.0.1:4523/m1/8748305-8536319-8439918/api/auth/login
          // target 取到项目 ID；rewrite 把 /api/mock 还原为 /api
          '/mock': {
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/mock/, ''),
            target: 'http://127.0.0.1:4523/m1/8748305-8536319-8439918',
            ws: true,
          },
          // '/api': {
          //   changeOrigin: true,
          //   rewrite: (path) => path.replace(/^\/api/, ''),
          //   // mock代理目标地址
          //   target: 'http://localhost:5320/api',
          //   ws: true,
          // },
        },
      },
    },
  };
});
