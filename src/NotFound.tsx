interface NotFoundProps {
  method: string;
  path: string;
}

export default function NotFound({ method, path }: NotFoundProps) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center">
        <h1 className="mb-4 text-6xl font-bold text-gray-800">404</h1>
        <p className="mb-8 text-xl text-gray-600">Page not found</p>
        <p className="mb-8 text-gray-500">
          {method} {path}
        </p>
        <a
          href="/"
          className="inline-block px-6 py-3 text-white transition-colors bg-blue-500 rounded-lg hover:bg-blue-600"
        >
          Go Home
        </a>
      </div>
    </div>
  );
}
