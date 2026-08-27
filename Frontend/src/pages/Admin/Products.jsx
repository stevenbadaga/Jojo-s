import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { productsAPI } from '../../services/api'
import { useToast } from '../../contexts/ToastContext'
import { Plus, Edit, Trash2, Upload, Search, Filter, X, Check, ArrowLeft, Home } from 'lucide-react'
import AdminSidebar from '../../components/AdminSidebar'
import { getImageUrl } from '../../utils/imageUtils'

const Products = () => {
  const toast = useToast()
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, productId: null, productName: '' })
  const [isAddingCategory, setIsAddingCategory] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    image: '',
    in_stock: true,
    is_promo: false,
    original_price: '',
    discount: '',
    active: true,
  })

  useEffect(() => {
    loadProducts()
  }, [])

  useEffect(() => {
    filterProducts()
  }, [products, searchQuery])

  const categoryOptions = useMemo(() => {
    const categoryMap = new Map()
    products.forEach((product) => {
      const category = product.category?.trim()
      if (!category) return
      const key = category.toLowerCase()
      if (!categoryMap.has(key)) {
        categoryMap.set(key, category)
      }
    })

    const currentCategory = formData.category?.trim()
    if (currentCategory) {
      const key = currentCategory.toLowerCase()
      if (!categoryMap.has(key)) {
        categoryMap.set(key, currentCategory)
      }
    }

    return Array.from(categoryMap.values()).sort((a, b) => a.localeCompare(b))
  }, [products, formData.category])

  // Auto-calculate price when promo fields change
  useEffect(() => {
    if (formData.is_promo && formData.original_price && formData.discount) {
      const originalPriceNum = parseFloat(formData.original_price)
      const discountNum = parseFloat(formData.discount)
      if (!isNaN(originalPriceNum) && !isNaN(discountNum) && discountNum >= 0 && discountNum <= 100) {
        const calculatedPrice = Math.round(originalPriceNum * (1 - discountNum / 100))
        const currentPrice = parseFloat(formData.price) || 0
        if (Math.abs(calculatedPrice - currentPrice) > 0.01) {
          setFormData(prev => ({ ...prev, price: calculatedPrice.toString() }))
        }
      }
    }
  }, [formData.is_promo, formData.original_price, formData.discount])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const response = await productsAPI.getAllProducts()
      setProducts(response.data)
      setFilteredProducts(response.data)
    } catch (error) {
      console.error('Failed to load products:', error)
      toast.error('Failed to load products. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const filterProducts = () => {
    let filtered = [...products]
    if (searchQuery) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    setFilteredProducts(filtered)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const data = {
        ...formData,
        price: parseInt(formData.price),
        original_price: formData.original_price
          ? parseInt(formData.original_price)
          : null,
        discount: formData.discount ? parseInt(formData.discount) : null,
      }

      if (editingProduct) {
        await productsAPI.updateProduct(editingProduct.id, data)
        toast.success('Product updated successfully!')
      } else {
        await productsAPI.createProduct(data)
        toast.success('Product created successfully! It will appear in the store.')
      }

      resetForm()
      loadProducts()
    } catch (error) {
      console.error('Failed to save product:', error)
      const errorMessage = error.response?.data?.error || 'Failed to save product. Please try again.'
      toast.error(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (product) => {
    setEditingProduct(product)
    setIsAddingCategory(false)
    setFormData({
      name: product.name || '',
      description: product.description || '',
      category: product.category || '',
      price: product.price || '',
      image: product.image || '',
      in_stock: product.in_stock !== false,
      is_promo: product.is_promo || false,
      original_price: product.original_price || '',
      discount: product.discount || '',
      active: product.active !== false,
    })
    setShowForm(true)
  }

  const handleDeleteClick = (product) => {
    setDeleteConfirm({
      show: true,
      productId: product.id,
      productName: product.name || 'this product'
    })
  }

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.productId) return
    
    try {
      await productsAPI.deleteProduct(deleteConfirm.productId)
      toast.success('Product deleted successfully!')
      setDeleteConfirm({ show: false, productId: null, productName: '' })
      loadProducts()
    } catch (error) {
      console.error('Failed to delete product:', error)
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          error.message || 
                          'Failed to delete product. Please try again.'
      toast.error(errorMessage)
      // Keep modal open if there's a specific error message so user can read it
      if (!errorMessage.includes('referenced') && !errorMessage.includes('orders')) {
        setDeleteConfirm({ show: false, productId: null, productName: '' })
      }
    }
  }

  const handleDeleteCancel = () => {
    setDeleteConfirm({ show: false, productId: null, productName: '' })
  }

  const handleToggleActive = async (product) => {
    try {
      const newActiveStatus = !(product.active !== false) // Handle null/undefined as false
      await productsAPI.toggleActive(product.id, newActiveStatus)
      toast.success(`Product ${newActiveStatus ? 'activated' : 'archived'} successfully!`)
      // Update the product in the local state immediately for better UX
      setProducts(products.map(p => 
        p.id === product.id ? { ...p, active: newActiveStatus } : p
      ))
      setFilteredProducts(filteredProducts.map(p => 
        p.id === product.id ? { ...p, active: newActiveStatus } : p
      ))
      // Also reload from server to ensure consistency
      setTimeout(() => loadProducts(), 500)
    } catch (error) {
      console.error('Failed to toggle active:', error)
      const errorMessage = error.response?.data?.error || 'Failed to update product status. Please try again.'
      toast.error(errorMessage)
    }
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }
    
    // Validate file size (max 20MB)
    if (file.size > 20 * 1024 * 1024) {
      toast.error('Image size must be less than 20MB')
      return
    }
    
    try {
      toast.info('Uploading image...')
      const response = await productsAPI.uploadImage(file)
      const imageUrl = response.data.url
      setFormData({ ...formData, image: imageUrl })
      toast.success('Image uploaded successfully!')
    } catch (error) {
      console.error('Failed to upload image:', error)
      const errorMessage = error.response?.data?.error || 'Failed to upload image. Please try again or use an image URL.'
      toast.error(errorMessage)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      price: '',
      image: '',
      in_stock: true,
      is_promo: false,
      original_price: '',
      discount: '',
      active: true,
    })
    setIsAddingCategory(false)
    setEditingProduct(null)
    setShowForm(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <AdminSidebar />
      <div className="flex-1">
        <div className="px-4 pb-4 pt-16 sm:px-6 sm:pb-6 sm:pt-16 lg:p-8">
          <div className="lg:hidden flex flex-wrap items-center gap-2 mb-4">
            <Link
              to="/admin"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-sm font-semibold text-gray-800 dark:text-gray-200 shadow-sm active:scale-[0.98] transition-transform"
            >
              <ArrowLeft className="w-4 h-4" />
              Dashboard
            </Link>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-sm font-semibold text-gray-800 dark:text-gray-200 shadow-sm active:scale-[0.98] transition-transform"
            >
              <Home className="w-4 h-4" />
              Store
            </Link>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Products
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                Manage your product catalog
              </p>
            </div>
            {/* Desktop Add Button */}
            <button
              onClick={() => {
                resetForm()
                setShowForm(true)
              }}
              className="hidden sm:flex btn-primary items-center justify-center gap-2 min-h-[48px] text-base touch-manipulation"
            >
              <Plus className="w-5 h-5" />
              <span>Add Product</span>
            </button>
            {/* Mobile Add Button - Full Width */}
            <button
              onClick={() => {
                resetForm()
                setShowForm(true)
              }}
              className="sm:hidden btn-primary flex items-center justify-center gap-2 w-full min-h-[52px] text-base touch-manipulation font-semibold"
            >
              <Plus className="w-6 h-6" />
              <span>Add Product</span>
            </button>
          </div>
          
          {/* Floating Action Button for Mobile - Alternative Option */}
          <button
            onClick={() => {
              resetForm()
              setShowForm(true)
            }}
            className="sm:hidden fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-emerald-600 to-teal-600 text-white shadow-2xl hover:shadow-emerald-600/50 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 touch-manipulation"
            aria-label="Add Product"
          >
            <Plus className="w-7 h-7" strokeWidth={2.5} />
          </button>

          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>

          {/* Product Form Modal */}
          {showForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm" onClick={(e) => e.target === e.currentTarget && resetForm()}>
              <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-3xl w-full max-h-[94vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-4 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {editingProduct ? 'Edit Product' : 'Add New Product'}
                  </h2>
                  <button
                    onClick={resetForm}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    aria-label="Close"
                  >
                    <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  </button>
                </div>
                <div className="p-4 sm:p-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                          Name *
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          className="input-field"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                          Category
                        </label>
                        <div className="space-y-2">
                          {!isAddingCategory ? (
                            <select
                              value={formData.category}
                              onChange={(e) => {
                                setFormData({ ...formData, category: e.target.value })
                                setIsAddingCategory(false)
                              }}
                              className="input-field"
                            >
                              <option value="">Select category</option>
                              {categoryOptions.map((category) => (
                                <option key={category} value={category}>
                                  {category}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type="text"
                              value={formData.category}
                              onChange={(e) =>
                                setFormData({ ...formData, category: e.target.value })
                              }
                              className="input-field"
                              placeholder="Enter new category"
                            />
                          )}
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                            {!isAddingCategory ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setIsAddingCategory(true)
                                  setFormData({ ...formData, category: '' })
                                }}
                                className="inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                              >
                                Add new category
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setIsAddingCategory(false)}
                                className="inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                              >
                                Use existing categories
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        Description
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({ ...formData, description: e.target.value })
                        }
                        className="input-field"
                        rows={3}
                      />
                    </div>

                    {formData.is_promo ? (
                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                            Original Price (RWF) *
                          </label>
                          <input
                            type="number"
                            value={formData.original_price}
                            onChange={(e) => {
                              const originalPrice = e.target.value
                              setFormData({
                                ...formData,
                                original_price: originalPrice,
                              })
                              if (originalPrice && formData.discount) {
                                const calculatedPrice = Math.round(
                                  parseFloat(originalPrice) * (1 - parseFloat(formData.discount) / 100)
                                )
                                setFormData(prev => ({ 
                                  ...prev, 
                                  original_price: originalPrice, 
                                  price: calculatedPrice.toString() 
                                }))
                              }
                            }}
                            className="input-field"
                            placeholder="Enter original price"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                            Discount (%) *
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={formData.discount}
                            onChange={(e) => {
                              const discount = e.target.value
                              setFormData({ ...formData, discount })
                              if (formData.original_price && discount) {
                                const calculatedPrice = Math.round(
                                  parseFloat(formData.original_price) * (1 - parseFloat(discount) / 100)
                                )
                                setFormData(prev => ({ 
                                  ...prev, 
                                  discount, 
                                  price: calculatedPrice.toString() 
                                }))
                              }
                            }}
                            className="input-field"
                            placeholder="Enter discount percentage"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                            Sale Price (RWF) *
                          </label>
                          <input
                            type="number"
                            value={formData.price}
                            className="input-field bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
                            readOnly
                            required
                          />
                          {formData.original_price && formData.discount && (
                            <p className="text-xs text-green-600 dark:text-green-400 mt-1 font-medium">
                              ✓ Calculated: {Math.round(parseFloat(formData.original_price) * (1 - parseFloat(formData.discount) / 100)).toLocaleString()} RWF
                            </p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                          Price (RWF) *
                        </label>
                        <input
                          type="number"
                          value={formData.price}
                          onChange={(e) =>
                            setFormData({ ...formData, price: e.target.value })
                          }
                          className="input-field"
                          required
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        Product Image (URL Link or Upload) *
                      </label>
                      <div className="space-y-3">
                        <div className="flex flex-col sm:flex-row gap-2">
                          <input
                            type="url"
                            value={formData.image}
                            onChange={(e) =>
                              setFormData({ ...formData, image: e.target.value })
                            }
                            className="input-field flex-1 text-sm"
                            placeholder="Paste image link URL (e.g. https://images.unsplash.com/...)"
                          />
                          <label className="btn-outline cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap w-full sm:w-auto px-4 py-2.5">
                            <Upload className="w-4 h-4" />
                            Upload File
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="hidden"
                            />
                          </label>
                        </div>

                        {/* Quick Preset Image Links for Admins */}
                        <div>
                          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Quick Grocery Image Link Presets:</p>
                          <div className="flex flex-wrap gap-1.5">
                            {[
                              { label: '🥑 Avocado', url: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=800&q=80' },
                              { label: '🍓 Strawberry', url: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=800&q=80' },
                              { label: '🫑 Bell Peppers', url: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=800&q=80' },
                              { label: '🥛 Fresh Milk', url: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=800&q=80' },
                              { label: '🍞 Sourdough', url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80' },
                              { label: '🫒 Olive Oil', url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80' },
                              { label: '🥚 Eggs', url: 'https://images.unsplash.com/photo-1516448620398-c5f44bf9f441?auto=format&fit=crop&w=800&q=80' },
                              { label: '🥬 Spinach', url: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=800&q=80' }
                            ].map((preset) => (
                              <button
                                key={preset.label}
                                type="button"
                                onClick={() => setFormData({ ...formData, image: preset.url })}
                                className="text-xs px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-colors"
                              >
                                {preset.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {formData.image && (
                          <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center gap-4">
                            <img
                              src={getImageUrl(formData.image)}
                              alt="Product preview"
                              className="w-20 h-20 object-cover rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex-shrink-0"
                              onError={(e) => {
                                e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80'
                              }}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">Image Link Preview Active</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{formData.image}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.in_stock}
                          onChange={(e) =>
                            setFormData({ ...formData, in_stock: e.target.checked })
                          }
                          className="rounded"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          In Stock
                        </span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.is_promo}
                          onChange={(e) => {
                            const isPromo = e.target.checked
                            setFormData({ 
                              ...formData, 
                              is_promo: isPromo,
                              ...(isPromo ? {} : { original_price: '', discount: '' })
                            })
                          }}
                          className="rounded"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          Promo
                        </span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.active}
                          onChange={(e) =>
                            setFormData({ ...formData, active: e.target.checked })
                          }
                          className="rounded"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          Active (Product will appear in store)
                        </span>
                      </label>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                      <button 
                        type="submit" 
                        className="btn-primary flex-1 flex items-center justify-center gap-2"
                        disabled={submitting}
                      >
                        {submitting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            {editingProduct ? 'Updating...' : 'Creating...'}
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4" />
                            {editingProduct ? 'Update Product' : 'Create Product'}
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={resetForm}
                        className="btn-outline"
                        disabled={submitting}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Products Table */}
          <div className="space-y-4">
            {/* Mobile Cards */}
            <div className="sm:hidden space-y-4">
              {filteredProducts.length === 0 ? (
                <div className="card p-8 text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {searchQuery ? 'No products match your search.' : 'No products yet.'}
                  </p>
                </div>
              ) : (
                filteredProducts.map((product) => (
                  <div key={product.id} className="card p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <img
                        src={getImageUrl(product.image)}
                        alt={product.name}
                        className="w-14 h-14 rounded-lg object-cover border border-gray-200 dark:border-gray-700"
                        onError={(e) => {
                          e.target.src = '/placeholder.png'
                        }}
                      />
                      <div className="flex-1">
                        <p className="text-base font-semibold text-gray-900 dark:text-white">
                          {product.name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {product.category || 'Uncategorized'}
                        </p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
                          {product.price.toLocaleString()} RWF
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {product.active !== false ? (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                          Archived
                        </span>
                      )}
                      {product.in_stock ? (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          In Stock
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                          Out of Stock
                        </span>
                      )}
                      {product.is_promo && (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                          Promo
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-800">
                      <button
                        onClick={() => handleToggleActive(product)}
                        className="text-sm font-medium text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        {product.active ? 'Archive' : 'Activate'}
                      </button>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="text-accent hover:text-accent-darker p-2"
                          aria-label="Edit product"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(product)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-2"
                          aria-label="Delete product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Desktop Table */}
            <div className="card overflow-hidden hidden sm:block">
              <div className="overflow-x-auto">
                <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <img
                            src={getImageUrl(product.image)}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded"
                            onError={(e) => {
                              e.target.src = '/placeholder.png'
                            }}
                          />
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {product.name}
                            </div>
                            {product.active === false && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">Archived</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {product.category || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {product.price.toLocaleString()} RWF
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          {product.active !== false ? (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                              Archived
                            </span>
                          )}
                          {product.in_stock ? (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                              In Stock
                            </span>
                          ) : (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                              Out of Stock
                            </span>
                          )}
                          {product.is_promo && (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                              Promo
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggleActive(product)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            title={product.active ? 'Archive' : 'Activate'}
                          >
                            {product.active ? 'Archive' : 'Activate'}
                          </button>
                          <button
                            onClick={() => handleEdit(product)}
                            className="text-accent hover:text-accent-darker"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(product)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-2 min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation"
                            aria-label="Delete product"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={handleDeleteCancel}
        >
          <div 
            className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full shadow-2xl transform transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Delete Product
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    This action cannot be undone
                  </p>
                </div>
                <button
                  onClick={handleDeleteCancel}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation"
                  aria-label="Close"
                >
                  <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-6">
              <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                Are you sure you want to permanently delete <span className="font-semibold text-gray-900 dark:text-white">"{deleteConfirm.productName}"</span>? 
                This action cannot be undone and will remove the product from your catalog.
              </p>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-5 border-t border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row gap-3 sm:gap-3">
              <button
                onClick={handleDeleteCancel}
                className="flex-1 sm:flex-initial sm:min-w-[120px] px-6 py-3.5 rounded-xl border-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 active:bg-gray-100 dark:active:bg-gray-700 transition-all duration-200 min-h-[52px] touch-manipulation"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 sm:flex-initial sm:min-w-[120px] px-6 py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold shadow-lg hover:shadow-xl active:scale-95 transition-all duration-200 min-h-[52px] touch-manipulation"
              >
                Delete Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Products
