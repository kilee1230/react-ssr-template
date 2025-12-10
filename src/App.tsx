import { ServerData, ServerDataSchema } from "./types";

interface AppProps {
  serverData?: ServerData;
}

export default function App({ serverData }: AppProps) {
  if (!serverData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  const validated = ServerDataSchema.parse(serverData);

  console.log({ validated });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container px-4 py-12 mx-auto">
        <div className="max-w-4xl mx-auto">
          <h1 className="mb-2 text-4xl font-bold text-gray-900">
            React SSR with Express
          </h1>
          <p className="mb-8 text-gray-600">
            Server-rendered at: {new Date(validated.timestamp).toLocaleString()}
          </p>

          <div className="p-6 bg-white rounded-lg shadow-lg">
            <h2 className="mb-4 text-2xl font-semibold text-gray-800">
              Users ({validated.users.length})
            </h2>
            <div className="space-y-4">
              {validated.users.map((user) => (
                <div
                  key={user.id}
                  className="p-4 transition-shadow border border-gray-200 rounded-lg hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {user.name}
                      </h3>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        user.role === "admin"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {user.role}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
