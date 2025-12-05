import { Request, Response } from 'express';
import { UserService } from '../services/user.service.js';
import { RenderService } from '../services/render.service.js';

export class AppController {
  constructor(
    private readonly userService: UserService,
    private readonly renderService: RenderService
  ) {}

  async renderApp(_req: Request, res: Response): Promise<void> {
    try {
      const serverData = await this.userService.getServerData();
      const html = this.renderService.renderHTML(serverData);
      res.send(html);
    } catch (error) {
      console.error('Error rendering app:', error);
      res.status(500).send('Internal Server Error');
    }
  }
}
