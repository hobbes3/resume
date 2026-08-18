import { defineConfig } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig({
  plugins: [
    {
      name: "exclude-woff",
      generateBundle(_, bundle) {
        for (const fileName of Object.keys(bundle)) {
          if (fileName.endsWith(".woff")) {
            Reflect.deleteProperty(bundle, fileName);
          }
        }
      },
    },
    viteStaticCopy({
      targets: [
        {
          src: ".lycheeignore",
          dest: "./",
        },
      ],
    }),
  ],
});
