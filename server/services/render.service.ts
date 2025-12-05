import { ServerData } from '../../src/types.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class RenderService {
  private readonly cdnUrl: string;
  private readonly isProd: boolean;

  constructor(cdnUrl: string, isProd: boolean) {
    this.cdnUrl = cdnUrl;
    this.isProd = isProd;
  }

  private getAssetTags(): { scriptTag: string; cssTag: string } {
    let scriptTag = '';
    let cssTag = '';

    // Path from dist-server/server/services/ to project root dist/
    const manifestPath = path.join(__dirname, '../../../dist/.vite/manifest.json');
    if (fs.existsSync(manifestPath)) {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
      const entry = manifest['src/client.tsx'];
      if (entry) {
        scriptTag = `<script type="module" src="${this.cdnUrl}/${entry.file}"></script>`;
        if (entry.css && entry.css.length > 0) {
          cssTag = entry.css
            .map((css: string) => `<link rel="stylesheet" href="${this.cdnUrl}/${css}">`)
            .join('\n');
        }
      }
    } else {
      // Fallback if manifest doesn't exist
      scriptTag = `<script type="module" src="${this.cdnUrl}/client.js"></script>`;
    }

    // Add Tailwind CDN in development if no CSS
    if (!this.isProd && !cssTag) {
      cssTag = '<script src="https://cdn.tailwindcss.com"></script>';
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
}
