import { ServerData, User } from "../../src/types.js";

export class UserService {
  async getUsers(): Promise<User[]> {
    // Simulate database/API call
    return [
      {
        id: 1,
        name: "Alice Johnson",
        email: "alice@example.com",
        role: "admin",
      },
      { id: 2, name: "Bob Smith", email: "bob@example.com", role: "user" },
      { id: 3, name: "Carol White", email: "carol@example.com", role: "user" },
    ];
  }

  async getServerData(): Promise<ServerData> {
    const users = await this.getUsers();

    console.log("users", users);
    return {
      users,
      timestamp: Date.now(),
    };
  }
}
