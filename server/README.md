# Server Architecture

Clean architecture implementation with separation of concerns.

## Structure

```
server/
├── index.ts                    # Application entry point
├── controllers/                # Request handlers
│   ├── health.controller.ts    # Health check endpoint
│   └── app.controller.ts       # Main app rendering
├── services/                   # Business logic
│   ├── user.service.ts         # User data operations
│   └── render.service.ts       # HTML rendering logic
├── middleware/                 # Express middleware
│   └── bot-protection.ts       # Security middleware
└── routes/                     # Route definitions
    └── index.ts                # Route configuration
```

## Layers

### 1. Controllers
Handle HTTP requests and responses. No business logic.

```typescript
export class AppController {
  async renderApp(req: Request, res: Response): Promise<void> {
    const data = await this.userService.getServerData();
    const html = this.renderService.renderHTML(data);
    res.send(html);
  }
}
```

### 2. Services
Contain business logic and data operations.

```typescript
export class UserService {
  async getUsers(): Promise<User[]> {
    // Database/API calls here
  }
}
```

### 3. Middleware
Cross-cutting concerns like security, logging.

```typescript
app.use(botProtectionMiddleware());
```

### 4. Routes
Define URL patterns and connect to controllers.

```typescript
router.get('/health', healthController.getHealth);
```

## Adding New Features

### Add a new endpoint:

1. **Create service** (if needed):
```typescript
// services/product.service.ts
export class ProductService {
  async getProducts() { ... }
}
```

2. **Create controller**:
```typescript
// controllers/product.controller.ts
export class ProductController {
  constructor(private productService: ProductService) {}
  
  async getProducts(req: Request, res: Response) {
    const products = await this.productService.getProducts();
    res.json(products);
  }
}
```

3. **Add route**:
```typescript
// routes/index.ts
router.get('/api/products', productController.getProducts);
```

4. **Wire up in index.ts**:
```typescript
const productService = new ProductService();
const productController = new ProductController(productService);
```

## Benefits

- **Testability**: Each layer can be tested independently
- **Maintainability**: Clear separation of concerns
- **Scalability**: Easy to add new features
- **Reusability**: Services can be shared across controllers
