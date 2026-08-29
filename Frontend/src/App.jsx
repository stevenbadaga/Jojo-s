import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { AuthProvider } from './contexts/AuthContext'
import { CartProvider } from './contexts/CartContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { ToastProvider } from './contexts/ToastContext'
import Layout from './components/Layout'
import ErrorBoundary from './components/ErrorBoundary'
import ProtectedRoute from './components/ProtectedRoute'
import { LoadingSpinner } from './components/SkeletonLoader'

// Lazy load pages for better performance
const Home = lazy(() => import('./pages/Home'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const ResetPassword = lazy(() => import('./pages/ResetPassword'))
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'))
const ResendVerification = lazy(() => import('./pages/ResendVerification'))
const Account = lazy(() => import('./pages/Account'))
const Profile = lazy(() => import('./pages/Profile'))
const Wishlist = lazy(() => import('./pages/Wishlist'))
const Products = lazy(() => import('./pages/Products'))
const ProductDetail = lazy(() => import('./pages/ProductDetail'))
const Insights = lazy(() => import('./pages/Insights'))
const About = lazy(() => import('./pages/About'))
const Contact = lazy(() => import('./pages/Contact'))
const TrackOrder = lazy(() => import('./pages/TrackOrder'))
const ShippingInfo = lazy(() => import('./pages/ShippingInfo'))
const ReturnsRefunds = lazy(() => import('./pages/ReturnsRefunds'))
const FAQ = lazy(() => import('./pages/FAQ'))
const AdminDashboard = lazy(() => import('./pages/Admin/Dashboard'))
const AdminProducts = lazy(() => import('./pages/Admin/Products'))
const AdminOrders = lazy(() => import('./pages/Admin/Orders'))
const AdminAnalytics = lazy(() => import('./pages/Admin/Analytics'))
const AdminCustomers = lazy(() => import('./pages/Admin/Customers'))

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
    <LoadingSpinner />
  </div>
)

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <ToastProvider>
              <Router
                future={{
                  v7_startTransition: true,
                  v7_relativeSplatPath: true,
                }}
              >
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route path="/" element={<Layout />}>
                      <Route index element={<Home />} />
                      <Route path="login" element={<Login />} />
                      <Route path="register" element={<Register />} />
                      <Route path="forgot-password" element={<ForgotPassword />} />
                      <Route path="reset-password" element={<ResetPassword />} />
                      <Route path="verify-email" element={<VerifyEmail />} />
                      <Route path="resend-verification" element={<ResendVerification />} />
                      <Route path="products" element={<Products />} />
                      <Route path="products/:id" element={<ProductDetail />} />
                      <Route path="insights" element={<Insights />} />
                      <Route path="about" element={<About />} />
                      <Route path="contact" element={<Contact />} />
                      <Route path="track-order" element={<TrackOrder />} />
                      <Route path="shipping-info" element={<ShippingInfo />} />
                      <Route path="returns-refunds" element={<ReturnsRefunds />} />
                      <Route path="faq" element={<FAQ />} />
                      <Route path="wishlist" element={<Wishlist />} />
                      <Route
                        path="account"
                        element={
                          <ProtectedRoute>
                            <Account />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="profile"
                        element={
                          <ProtectedRoute>
                            <Profile />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="admin"
                        element={
                          <ProtectedRoute requireAdmin>
                            <AdminDashboard />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="admin/products"
                        element={
                          <ProtectedRoute requireAdmin>
                            <AdminProducts />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="admin/orders"
                        element={
                          <ProtectedRoute requireAdmin>
                            <AdminOrders />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="admin/analytics"
                        element={
                          <ProtectedRoute requireAdmin>
                            <AdminAnalytics />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="admin/customers"
                        element={
                          <ProtectedRoute requireAdmin>
                            <AdminCustomers />
                          </ProtectedRoute>
                        }
                      />
                    </Route>
                  </Routes>
                </Suspense>
              </Router>
            </ToastProvider>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default App
