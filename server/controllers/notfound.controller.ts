import { Request, Response } from 'express';

export class NotFoundController {
  handle(req: Request, res: Response): void {
    const acceptsHtml = req.accepts('html');
    
    if (acceptsHtml) {
      res.status(404).send(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>404 - Not Found</title>
            <script src="https://cdn.tailwindcss.com"></script>
          </head>
          <body class="bg-gray-100 min-h-screen flex items-center justify-center">
            <div class="text-center">
              <h1 class="text-6xl font-bold text-gray-800 mb-4">404</h1>
              <p class="text-xl text-gray-600 mb-8">Page not found</p>
              <p class="text-gray-500 mb-8">${req.method} ${req.path}</p>
              <a href="/" class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg inline-block">
                Go Home
              </a>
            </div>
          </body>
        </html>
      `);
    } else {
      res.status(404).json({
        error: 'Not Found',
        message: `Cannot ${req.method} ${req.path}`,
        path: req.path,
      });
    }
  }
}
