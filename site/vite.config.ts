import path from 'path';
import vue from '@vitejs/plugin-vue';
import md from '../plugin/md';
import docs from '../plugin/docs';
import vueJsx from '@vitejs/plugin-vue-jsx';
import { additionalData } from './themeConfig';
/**
 * @type {import('vite').UserConfig}
 */
export default {
  resolve: {
    alias: {
      vue: 'vue/dist/vue.esm-bundler.js',
      'ant-design-vue/es': path.resolve(__dirname, '../components'),
      'ant-design-vue': path.resolve(__dirname, '../components'),
    },
  },
  server: {
    host: true,
  },
  plugins: [
    vueJsx({
      // options are passed on to @vue/babel-plugin-jsx
      mergeProps: false,
      enableObjectSlots: false,
    }),
    docs(),
    md(),
    vue({
      include: [/\.vue$/, /\.md$/],
    }),
  ],
  build: {
    // 预览类依赖（pdf/excel/docx）体积很大，单独拆块：既避免单 chunk 过大撑爆构建内存，
    // 也让 vue 运行时不被并进这些业务块而拖慢首屏
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('@vue-office/pdf')) return 'vue-office-pdf';
          if (id.includes('@vue-office/excel')) return 'vue-office-excel';
          if (id.includes('@vue-office/docx')) return 'vue-office-docx';
          if (id.includes('node_modules/vue/') || id.includes('node_modules/@vue/')) return 'vue';
          return undefined;
        },
      },
    },
  },
  optimizeDeps: {
    include: [
      'fetch-jsonp',
      '@ant-design/icons-vue',
      'lodash-es',
      'dayjs',
      'vue',
      'vue-router',
      'vue-i18n',
      'async-validator',
    ],
  },
  css: {
    preprocessorOptions: {
      less: {
        modifyVars: {
          hack: `true;@import "${require.resolve('../components/style/color/colorPalette.less')}";`,
          'root-entry-name': 'variable',
        },
        javascriptEnabled: true,
        // includePaths: ["node_modules/"],
        additionalData,
      },
    },
  },
};
