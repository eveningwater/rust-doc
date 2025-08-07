import DefaultTheme from "vitepress/theme";
import "viewerjs/dist/viewer.min.css";
import imageViewer from "vitepress-plugin-image-viewer";
import vImageViewer from "vitepress-plugin-image-viewer/lib/vImageViewer.vue";
import { EnhanceAppContext, useRoute } from "vitepress";
import "./styles/custom.css";

export default {
  ...DefaultTheme,
  enhanceApp(ctx: EnhanceAppContext) {
    DefaultTheme.enhanceApp(ctx);
    ctx.app.component("vImageViewer", vImageViewer);
  },
  setup() {
    // 获取路由
    const route = useRoute();
    // 使用
    imageViewer(route);
  },
};
