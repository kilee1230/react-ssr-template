import { Request, Response } from 'express';

export class NotFoundController {
  handle(req: Request, res: Response): void {
    res.status(404).json({
      error: 'Not Found',
      message: `Cannot ${req.method} ${req.path}`,
      path: req.path,
    });
  }
}
