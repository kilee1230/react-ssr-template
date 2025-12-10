import { ServerData, NotFoundData } from "../../src/types.js";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Vite dev server URL for HMR
const VITE_DEV_SERVER = process.env.VITE_DEV_SERVER || "http://localhost:5173";

export class RenderService {
  private readonly cdnUrl: string;
  private readonly isProd: boolean;

  constructor(cdnUrl: string, isProd: boolean) {
    this.cdnUrl = cdnUrl;
    this.isProd = isProd;
  }

  private getAssetTags(): { scriptTag: string; cssTag: string } {
    // In development mode, use Vite dev server for HMR
    if (!this.isProd) {
      return {
        scriptTag: `
          <script type="module">
            import RefreshRuntime from "${VITE_DEV_SERVER}/@react-refresh"
            RefreshRuntime.injectIntoGlobalHook(window)
            window.$RefreshReg$ = () => {}
            window.$RefreshSig$ = () => (type) => type
            window.__vite_plugin_react_preamble_installed__ = true
          </script>
          <script type="module" src="${VITE_DEV_SERVER}/@vite/client"></script>
          <script type="module" src="${VITE_DEV_SERVER}/src/client.tsx"></script>
        `,
        cssTag: "", // Vite injects CSS via JS in dev mode
      };
    }

    // Production mode: use manifest for hashed assets
    let scriptTag = "";
    let cssTag = "";

    // Path from dist-server/server/services/ to project root dist/
    const manifestPath = path.join(
      __dirname,
      "../../../dist/.vite/manifest.json"
    );
    if (fs.existsSync(manifestPath)) {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
      const entry = manifest["src/client.tsx"];
      if (entry) {
        scriptTag = `<script type="module" src="${this.cdnUrl}/${entry.file}"></script>`;
        if (entry.css && entry.css.length > 0) {
          cssTag = entry.css
            .map(
              (css: string) =>
                `<link rel="stylesheet" href="${this.cdnUrl}/${css}">`
            )
            .join("\n");
        }
      }
    } else {
      // Fallback if manifest doesn't exist
      scriptTag = `<script type="module" src="${this.cdnUrl}/client.js"></script>`;
    }

    return { scriptTag, cssTag };
  }

  renderHTML(serverData: ServerData): string {
    const { scriptTag, cssTag } = this.getAssetTags();

    return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>React SSR App</title>
        ${cssTag}
      </head>
      <body>
        <div id="root"></div>
        <script>
          window.__SERVER_DATA__ = ${JSON.stringify(serverData)};
        </script>
        ${scriptTag}
      </body>
    </html>
  `;
  }

  renderNotFound(notFoundData: NotFoundData): string {
    const { scriptTag, cssTag } = this.getAssetTags();

    return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>404 - Not Found</title>
        ${cssTag}
      </head>
      <body>
        <div id="root"></div>
        <script>
          window.__SERVER_DATA__ = ${JSON.stringify(notFoundData)};
        </script>
        ${scriptTag}
      </body>
    </html>
  `;
  }
}
