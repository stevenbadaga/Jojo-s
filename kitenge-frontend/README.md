# Esoko - React Frontend

Modern, beautiful React frontend for Esoko e-commerce platform.

## 🚀 Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Axios** - HTTP client
- **Lucide React** - Icons

## 📦 Installation

```bash
cd kitenge-frontend
npm install
```

## 🏃 Running the Application

### Development
```bash
npm run dev
```

The app will be available at http://localhost:3000

### Production Build
```bash
npm run build
npm run preview
```

## 🔗 Backend Connection

The frontend is configured to connect to the Spring Boot backend at `http://localhost:8080`.

To change the backend URL, create a `.env` file:
```
VITE_API_URL=http://localhost:8080/api
```

## ✨ Features

- ✅ Modern, responsive UI with Tailwind CSS
- ✅ Dark mode support
- ✅ Product browsing with search and filters
- ✅ Shopping cart functionality
- ✅ User authentication (JWT)
- ✅ Wishlist management
- ✅ Admin dashboard
- ✅ Product management
- ✅ Order management
- ✅ Image upload
- ✅ WhatsApp checkout integration

## 📁 Project Structure

```
kitenge-frontend/
├── src/
│   ├── components/     # Reusable components
│   ├── contexts/       # React contexts (Auth, Cart, Theme)
│   ├── pages/          # Page components
│   ├── services/       # API services
│   ├── App.jsx         # Main app component
│   └── main.jsx        # Entry point
├── public/             # Static assets
└── package.json
```

## 🎨 Design Features

- Clean, modern interface
- Smooth animations and transitions
- Responsive design (mobile-first)
- Dark mode support
- Accessible components
- Beautiful color scheme (Orange accent on black/white)

## 🔐 Authentication

- JWT tokens stored in localStorage
- Automatic token refresh
- Protected routes for authenticated users
- Admin-only routes

## 🛒 Cart & Checkout

- Local storage persistence
- Real-time cart updates
- WhatsApp integration for checkout
- Order history tracking

## 👨‍💼 Admin Features

- Dashboard with metrics
- Product CRUD operations
- Order management
- Image upload
- Product activation/deactivation

---

Built with ❤️ for Esoko

