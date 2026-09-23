# Jojo's

Jojo's is a web-based platform for managing the day-to-day operations of the business, from the customer-facing storefront to the internal admin dashboard.

The project is built to keep product management, orders, sales, and business operations in one place instead of relying on separate tools.

## What is included

- Customer-facing product and shopping experience
- Product catalogue and product management
- Order management
- WhatsApp-based ordering
- Sales overview and reporting
- Admin dashboard
- Business and operational data management
- Responsive interface for desktop and mobile use

## Project structure

The repository contains the application code, configuration, and assets needed to run the platform.

The main areas of the application are:

- **Storefront** — the public side where customers browse products and place orders
- **Admin** — the private side used to manage products, orders, and sales
- **Shared components** — reusable interface elements used across the application

## Running the project locally

Install the dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Then open the local address shown in the terminal.

To create a production build:

```bash
npm run build
```

## Environment variables

Some features may require environment variables depending on the current deployment and integrations.

Keep private keys, credentials, and other secrets in the local environment file or deployment settings. Do not commit them to the repository.

## Development notes

This is an active project. The interface and business workflows may change as new requirements are added and existing parts are refined.

When making changes, keep the customer experience and the admin experience consistent with the existing design. Changes to orders, products, or sales should also be checked from the admin side before being considered complete.

## Deployment

The project is intended to be deployed as a web application. The production environment should provide the required environment variables and any external services used by the application.

## Status

Actively developed.

---

Built for Jojo's.
