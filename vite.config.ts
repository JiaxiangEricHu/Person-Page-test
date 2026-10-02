import sceneSettings from './content/scene.json';
import {prepareConfig} from './scripts/config.mjs';
import {resolve} from 'node:path';
import { defineConfig } from "vite";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { createHash } from "node:crypto";
import { generateCatalog, readProjects, renderMarkdown, projectPage, projectIndex, escapeHtml } from "./scripts/content.mjs";

// Keep Blender's stable source/export paths, while production URLs identify
// exact bytes and can be cached without revalidation across deployments.
const models = (sceneSettings.lightweightGeometry ? [] : ["archive-cassette", "archive-assembly"]).map(name => {
  const source = readFileSync(`public/assets/${name}.glb`);
  const hash = createHash("sha256").update(source).digest("hex").slice(0,16);
  return { key:`assets/${name}.glb`, fileName:`assets/${name}.${hash}.glb`, source };
});
const hasNovecento = ["Normal", "DemiBold", "Bold"].every(weight =>
  existsSync(`public/fonts/novecento/webFonts/NovecentoSansWide${weight}/font.woff2`),
);
export default defineConfig(({ mode, command }) => ({
  base: "./",
  build: {rollupOptions: {input: {home: resolve("index.html"), editor: resolve("editor.html")}}},
  define: {
    __RHINE_MODELS__: JSON.stringify(Object.fromEntries(models.map(model => [model.key,model.fileName]))),
    __RHINE_NOVECENTO__: JSON.stringify(hasNovecento),
  },
  plugins: [{
    name: "markdown-project-pages",
    async buildStart() {
      if (command !== "build") return;
      await prepareConfig();
      const { projects, site } = await readProjects();
      for (const project of projects) {
        this.emitFile({ type: "asset", fileName: `projects/${project.slug}/index.html`, source: projectPage(project, await renderMarkdown(project, projects), site) });
      }
      this.emitFile({ type: "asset", fileName: "projects/index.html", source: projectIndex(projects,site) });
      this.emitFile({ type: "asset", fileName: ".nojekyll", source: "" });
    },
    async transformIndexHtml(html, ctx) {
      if (ctx.filename.endsWith("editor.html")) return html;
      const {site}=await readProjects();
      return html.replace(/<title>[^<]*<\/title>/,`<title>${escapeHtml(site.title)}</title>`)
        .replace(/<meta name="description" content="[^"]*">/,`<meta name="description" content="${escapeHtml(site.description)}">`);
    },
    configureServer(server) {
      server.watcher.add("content");
      server.watcher.on("all", async (_event, file) => {
        if (!file.replaceAll("\\", "/").match(/content\/((site|ui|design|scene|publishing)\.json|projects\/[^/]+\.md)$/)) return;
        try { await prepareConfig(); await generateCatalog(); server.ws.send({type:"full-reload"}); }
        catch (error) { server.config.logger.error(String(error)); }
      });
      server.middlewares.use(async (req,res,next) => {
        const pathname = (req.url || "").split("?")[0];
        if (!pathname.startsWith("/projects")) return next();
        if (pathname === "/projects") {res.statusCode=302;res.setHeader("Location","/projects/");res.end();return;}
        try {
          const { projects,site } = await readProjects();
          let html;
          if (["/projects","/projects/","/projects/index.html"].includes(pathname)) html=projectIndex(projects,site);
          else {
            const slug=pathname.match(/^\/projects\/([a-z0-9-]+)(?:\/|\/index\.html)?$/)?.[1];
            const project=projects.find(p=>p.slug===slug);
            if(!project){res.statusCode=404;res.end("Project not found");return;}
            if(!pathname.endsWith("/")&&!pathname.endsWith(".html")){res.statusCode=302;res.setHeader("Location",`${pathname}/`);res.end();return;}
            html=projectPage(project,await renderMarkdown(project,projects),site);
          }
          res.setHeader("Content-Type","text/html; charset=utf-8");res.end(html);
        } catch(error) {res.statusCode=500;res.end(String(error));}
      });
    },
  }, {
    name: "versioned-model-assets", apply: "build",
    writeBundle(options) {
      // Keep originals in source for opt-in legacy rendering; omit unused downloads.
      if(sceneSettings.lightweightGeometry) for(const name of ['archive-cassette','archive-assembly']) rmSync(resolve(options.dir || 'dist',`assets/${name}.glb`),{force:true});
    },
    buildStart() { for (const model of models) this.emitFile({type:"asset",fileName:model.fileName,source:model.source}); },
  }, ...(mode === "wallpaper" ? [{
    name: "wallpaper-host",
    transformIndexHtml(html: string) {
      return { html: html.replace(/\s*<link rel="manifest"[^>]*>/, ""), tags: [{
        tag: "script", children: readFileSync("wallpaper/host.js", "utf8"), injectTo: "head-prepend" as const,
      }] };
    },
  }] : [])],
}));
