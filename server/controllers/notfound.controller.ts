import { Request, Response } from "express";
import { RenderService } from "../services/render.service.js";

export class NotFoundController {
  constructor(private readonly renderService: RenderService) {}

  handle(req: Request, res: Response): void {
    const acceptsHtml = req.accepts("html");

    if (acceptsHtml) {
      const html = this.renderService.renderNotFound({
        type: "notfound",
        method: req.method,
        path: req.path,
      });
      res.status(404).send(html);
    } else {
      res.status(404).json({
        error: "Not Found",
        message: `Cannot ${req.method} ${req.path}`,
        path: req.path,
      });
    }
  }
}
