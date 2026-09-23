# MarketMet — Fresh Groceries to Your Door

MarketMet is a grocery shopping and delivery platform built for customers to browse products, place orders, and manage their shopping experience online.

The project also includes an administration system for managing products, orders, customers, stock, sales, and other day-to-day operations.

## What the application does

### Customer storefront

- Browse grocery products by category
- Search and filter products
- View product details and availability
- Add products to a cart
- Save products to a wishlist
- Place orders
- Track order status
- Receive order and account notifications
- Use WhatsApp ordering where enabled
- Access the storefront from desktop or mobile devices

### Admin dashboard

- Manage the product catalogue
- Add, edit, and remove products
- Upload product images
- Manage stock quantities and low-stock thresholds
- View and manage orders
- Manage customers
- Review sales and analytics
- Manage promotional products
- Publish and manage MarketMet insights

## Project structure

The repository contains the customer-facing application, backend services, database schema, supporting assets, and deployment configuration.

```
Jojo-s/
├── Frontend/
│   ├── src/
│   │   ├── components/       Reusable UI components
│   │   ├── contexts/         Cart, authentication, toast and shared state
│   │   ├── data/             Fallback product and category data
│   │   ├── pages/             Storefront and admin pages
│   │   ├── services/         API communication
│   │   ├── utils/            Image, branding and application utilities
│   │   └── ...
│   ├── public/                Frontend static assets
│   ├── package.json           Frontend dependencies and scripts
│   ├── vite.config.js         Vite configuration
│   └── tailwind.config.js     Tailwind CSS configuration
│
├── BackendNext/
│   ├── app/                   API routes and backend application code
│   ├── lib/                   Backend services and integrations
│   ├── prisma/                Database schema and migrations
│   └── package.json           Backend dependencies and scripts
│
├── public/                    Legacy/static web assets
└── README.md                  Project documentation
```

## Product images

Product images can come from two places:

1. **Database products** — production products store an image URL with each product. The admin product workflow can upload images through Cloudinary and save the resulting URL.
2. **Fallback catalogue** — `Frontend/src/data/groceryData.js` contains fallback products with externally hosted image URLs. These are used when the public product API is unavailable or returns no products.

Remote image URLs are intentionally used so the frontend does not need to store every product photograph inside the repository.

## Icons and interface

The frontend uses **Lucide React** for interface icons. Keeping one icon system across the application makes navigation, actions, filters, status indicators, and other controls visually consistent.

The main dependency is declared in:

```
Frontend/package.json
```

## Technology

- React
- Vite
- Tailwind CSS
- React Router
- Axios
- Lucide React
- Next.js
- Prisma
- PostgreSQL
- Cloudinary
- Nodemailer

## Running the frontend

From the `Frontend` directory:

```bash
npm install
npm run dev
```

Create a production build with:

```bash
npm run build
```

## Running the backend

From the `BackendNext` directory:

```bash
npm install
npm run dev
```

For a production build:

```bash
npm run build
npm start
```

The backend also uses Prisma for database generation and migrations.

## Environment variables

The application uses environment variables for services such as the database, authentication, email delivery, image hosting, and API configuration.

Do not commit real credentials or private keys to the repository.

Use the provided environment examples where available and configure the required values in the local environment or deployment platform.

## Deployment

The repository contains deployment configuration for the frontend and backend. The production environment must provide the required environment variables and connected services.

The live application is currently intended to run as a web-based grocery storefront with a separate backend service.

## Development notes

MarketMet is an active project. The customer storefront, administration tools, catalogue, and business workflows may continue to change.

When changing the product catalogue, check both the customer-facing storefront and the admin product management screens. Changes to orders, stock, product images, sales, or WhatsApp ordering should be tested through the complete workflow before deployment.

## Status

Actively developed.

---

Built for MarketMet.
