import { useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  Archive,
  Boxes,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  History,
  Image as ImageIcon,
  Package,
  Pencil,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Upload,
  X,
} from 'lucide-react'
import AdminSidebar from '../../components/AdminSidebar'
import { productsAPI } from '../../services/api'
import { useToast } from '../../contexts/ToastContext'
import { getImageUrl } from '../../utils/imageUtils'

const EMPTY_FORM = {
  name: '',
  description: '',
  category: '',
  sku: '',
  unit: 'item',
  price: '',
  stock_quantity: '0',
  low_stock_threshold: '5',
  image: '',
  is_promo: false,
  original_price: '',
  discount: '',
  active: true,
}

const money = (value) => `${new Intl.NumberFormat('en-RW').format(Number(value) || 0)} RWF`
const number = (value) => new Intl.NumberFormat('en-RW').format(Number(value) || 0)

const stockTone = (product) => {
  if ((product.stock_quantity || 0) <= 0) return 'border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-300'
  if ((product.stock_quantity || 0) <= (product.low_stock_threshold ?? 5)) {
    return 'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300'
  }
  return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
}

const Products = () => {
  const toast = useToast()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [formData, setFormData] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [stockProduct, setStockProduct] = useState(null)
  const [stockForm, setStockForm] = useState({ mode: 'delta', quantity: '', type: 'RECEIPT', note: '' })
  const [historyProduct, setHistoryProduct] = useState(null)
  const [history, setHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => { loadProducts() }, [])

  const loadProducts = async ({ silent = false } = {}) => {
    silent ? setRefreshing(true) : setLoading(true)
    try {
      const response = await productsAPI.getAllProducts()
      setProducts(Array.isArray(response.data) ? response.data : [])
    } catch (error) {
      console.error('Failed to load inventory:', error)
      toast.error(error.response?.data?.error || 'Could not load inventory')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const metrics = useMemo(() => {
    const active = products.filter((product) => product.active !== false)
    return {
      catalog: products.length,
      units: active.reduce((sum, product) => sum + Math.max(0, Number(product.stock_quantity) || 0), 0),
      value: active.reduce((sum, product) => sum + Math.max(0, Number(product.stock_quantity) || 0) * (Number(product.price) || 0), 0),
      low: active.filter((product) => (product.stock_quantity || 0) > 0 && (product.stock_quantity || 0) <= (product.low_stock_threshold ?? 5)).length,
      out: active.filter((product) => (product.stock_quantity || 0) <= 0).length,
    }
  }, [products])

  const categories = useMemo(() => {
    return [...new Set(products.map((product) => product.category).filter(Boolean))].sort((a, b) => a.localeCompare(b))
  }, [products])

  const visibleProducts = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return products.filter((product) => {
      const matchesQuery = !normalized || [product.name, product.category, product.sku]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalized))
      if (!matchesQuery) return false
      if (filter === 'active') return product.active !== false
      if (filter === 'archived') return product.active === false
      if (filter === 'low') return product.active !== false && (product.stock_quantity || 0) > 0 && (product.stock_quantity || 0) <= (product.low_stock_threshold ?? 5)
      if (filter === 'out') return product.active !== false && (product.stock_quantity || 0) <= 0
      return true
    })
  }, [products, query, filter])

  const openCreate = () => {
    setEditing(null)
    setFormData(EMPTY_FORM)
    setShowForm(true)
  }

  const openEdit = (product) => {
    setEditing(product)
    setFormData({
      name: product.name || '',
      description: product.description || '',
      category: product.category || '',
      sku: product.sku || '',
      unit: product.unit || 'item',
      price: String(product.price ?? ''),
      stock_quantity: String(product.stock_quantity ?? 0),
      low_stock_threshold: String(product.low_stock_threshold ?? 5),
      image: product.image || '',
      is_promo: Boolean(product.is_promo),
      original_price: product.original_price == null ? '' : String(product.original_price),
      discount: product.discount == null ? '' : String(product.discount),
      active: product.active !== false,
    })
    setShowForm(true)
  }

  const closeForm = () => {
    if (saving) return
    setShowForm(false)
    setEditing(null)
    setFormData(EMPTY_FORM)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    try {
      const payload = {
        ...formData,
        price: Number.parseInt(formData.price, 10) || 0,
        stock_quantity: Math.max(0, Number.parseInt(formData.stock_quantity, 10) || 0),
        low_stock_threshold: Math.max(0, Number.parseInt(formData.low_stock_threshold, 10) || 0),
        original_price: formData.original_price === '' ? null : Number.parseInt(formData.original_price, 10),
        discount: formData.discount === '' ? null : Number.parseInt(formData.discount, 10),
      }
      if (editing) {
        await productsAPI.updateProduct(editing.id, payload)
        toast.success(`${formData.name} updated`)
      } else {
        await productsAPI.createProduct(payload)
        toast.success(`${formData.name} added to inventory`)
      }
      closeForm()
      await loadProducts({ silent: true })
    } catch (error) {
      console.error('Product save failed:', error)
      toast.error(error.response?.data?.error || 'Could not save product')
    } finally {
      setSaving(false)
    }
  }

  const toggleArchive = async (product) => {
    try {
      const active = product.active === false
      await productsAPI.toggleActive(product.id, active)
      toast.success(active ? `${product.name} restored to the storefront` : `${product.name} archived`)
      await loadProducts({ silent: true })
    } catch (error) {
      toast.error(error.response?.data?.error || 'Could not update product visibility')
    }
  }

  const openStock = (product) => {
    setStockProduct(product)
    setStockForm({ mode: 'delta', quantity: '', type: 'RECEIPT', note: '' })
  }

  const saveStock = async (event) => {
    event.preventDefault()
    if (!stockProduct) return
    const raw = Number.parseInt(stockForm.quantity, 10)
    if (!Number.isFinite(raw)) return toast.warning('Enter a stock quantity')
    try {
      await productsAPI.adjustStock(stockProduct.id, {
        ...stockForm,
        quantity: stockForm.mode === 'set' ? Math.max(0, raw) : raw,
      })
      toast.success(`Stock updated for ${stockProduct.name}`)
      setStockProduct(null)
      await loadProducts({ silent: true })
    } catch (error) {
      toast.error(error.response?.data?.error || 'Could not adjust stock')
    }
  }

  const openHistory = async (product) => {
    setHistoryProduct(product)
    setHistory([])
    setHistoryLoading(true)
    try {
      const response = await productsAPI.getStockHistory(product.id)
      setHistory(response.data?.movements || [])
    } catch (error) {
      toast.error(error.response?.data?.error || 'Could not load stock history')
    } finally {
      setHistoryLoading(false)
    }
  }

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) return toast.warning('Choose an image file')
    if (file.size > 20 * 1024 * 1024) return toast.warning('Image must be smaller than 20 MB')
    setUploading(true)
    try {
      const response = await productsAPI.uploadImage(file)
      setFormData((current) => ({ ...current, image: response.data.url }))
      toast.success('Image uploaded')
    } catch (error) {
      toast.error(error.response?.data?.error || 'Image upload failed')
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#F5F6F7] dark:bg-black">
        <AdminSidebar />
        <main className="flex-1 px-4 pb-10 pt-20 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto max-w-[1600px] animate-pulse space-y-5">
            <div className="h-20 rounded-2xl bg-gray-200 dark:bg-[#080808]" />
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[1,2,3,4].map((i) => <div key={i} className="h-32 rounded-2xl bg-gray-200 dark:bg-[#080808]" />)}</div>
            <div className="h-[480px] rounded-2xl bg-gray-200 dark:bg-[#080808]" />
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-[#F5F6F7] text-gray-950 dark:bg-black dark:text-white">
      <AdminSidebar />
      <main className="min-w-0 flex-1">
        <div className="mx-auto max-w-[1600px] px-4 pb-12 pt-20 sm:px-6 lg:px-8 lg:py-7">
          <header className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Catalog & inventory</p>
              <h1 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">Inventory control</h1>
              <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">Manage products, stock levels, low-stock thresholds and storefront visibility from one operational view.</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => loadProducts({ silent: true })} disabled={refreshing} className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs font-black text-gray-700 shadow-sm transition hover:border-gray-300 disabled:opacity-60 dark:border-white/10 dark:bg-[#080808] dark:text-gray-300">
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
              </button>
              <button onClick={openCreate} className="inline-flex items-center gap-2 rounded-xl bg-[#108910] px-4 py-2.5 text-xs font-black text-white shadow-sm transition hover:bg-[#0b731b]">
                <Plus className="h-4 w-4" /> Add product
              </button>
            </div>
          </header>

          <section className="mb-5 grid grid-cols-2 gap-3 xl:grid-cols-5">
            {[
              ['Catalog', number(metrics.catalog), Package, 'All product records'],
              ['Stock units', number(metrics.units), Boxes, 'Available units'],
              ['Inventory value', money(metrics.value), CircleDollarSign, 'Retail value on hand'],
              ['Low stock', number(metrics.low), AlertTriangle, 'Needs attention'],
              ['Out of stock', number(metrics.out), X, 'Unavailable products'],
            ].map(([label, value, Icon, helper]) => (
              <div key={label} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-[0_8px_24px_rgba(16,24,40,0.04)] dark:border-white/10 dark:bg-[#080808] dark:shadow-none">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-[0.12em] text-gray-400">{label}</p>
                    <p className="mt-2 truncate text-xl font-black sm:text-2xl">{value}</p>
                    <p className="mt-1 text-[11px] text-gray-500">{helper}</p>
                  </div>
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#108910]/10 text-[#108910]"><Icon className="h-4 w-4" /></span>
                </div>
              </div>
            ))}
          </section>

          <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_10px_30px_rgba(16,24,40,0.04)] dark:border-white/10 dark:bg-[#080808] dark:shadow-none">
            <div className="flex flex-col gap-3 border-b border-gray-100 p-4 dark:border-white/10 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative w-full lg:max-w-md">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search product, category or SKU" className="w-full rounded-xl border border-gray-200 bg-[#F7F8F8] py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-[#108910] focus:ring-2 focus:ring-[#108910]/10 dark:border-white/10 dark:bg-[#0D0D0D]" />
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
                <SlidersHorizontal className="h-4 w-4 flex-shrink-0 text-gray-400" />
                {[
                  ['all', 'All'], ['active', 'Active'], ['low', 'Low stock'], ['out', 'Out'], ['archived', 'Archived'],
                ].map(([value, label]) => (
                  <button key={value} onClick={() => setFilter(value)} className={`whitespace-nowrap rounded-full px-3 py-1.5 text-[11px] font-black transition ${filter === value ? 'bg-gray-950 text-white dark:bg-white dark:text-black' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-white/[0.06] dark:text-gray-400 dark:hover:bg-white/[0.1]'}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[980px] text-left">
                <thead className="bg-[#F8F9F9] text-[10px] font-black uppercase tracking-[0.1em] text-gray-400 dark:bg-[#0D0D0D]">
                  <tr>
                    <th className="px-5 py-3">Product</th>
                    <th className="px-4 py-3">Category / SKU</th>
                    <th className="px-4 py-3">Price</th>
                    <th className="px-4 py-3">Stock</th>
                    <th className="px-4 py-3">Storefront</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/[0.07]">
                  {visibleProducts.map((product) => (
                    <tr key={product.id} className="transition hover:bg-gray-50/70 dark:hover:bg-white/[0.025]">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <img src={getImageUrl(product.image)} alt="" className="h-12 w-12 rounded-xl border border-gray-100 object-cover dark:border-white/10" onError={(e) => { e.currentTarget.src = '/placeholder.png' }} />
                          <div className="min-w-0">
                            <p className="max-w-[260px] truncate text-sm font-black">{product.name}</p>
                            <p className="mt-1 text-[11px] text-gray-500">per {product.unit || 'item'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-xs font-bold text-gray-700 dark:text-gray-300">{product.category || 'Uncategorised'}</p>
                        <p className="mt-1 font-mono text-[10px] text-gray-400">{product.sku || 'No SKU'}</p>
                      </td>
                      <td className="px-4 py-4"><p className="text-sm font-black">{money(product.price)}</p>{product.is_promo && <p className="mt-1 text-[10px] font-bold text-orange-500">Promotion active</p>}</td>
                      <td className="px-4 py-4">
                        <button onClick={() => openStock(product)} className={`inline-flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs font-black ${stockTone(product)}`}>
                          {number(product.stock_quantity)} {product.unit || 'item'}{Number(product.stock_quantity) === 1 ? '' : 's'}
                        </button>
                        <p className="mt-1.5 text-[10px] text-gray-400">Alert at ≤ {number(product.low_stock_threshold)}</p>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-black ${product.active !== false ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'bg-gray-500/10 text-gray-500'}`}>
                          {product.active !== false ? 'LIVE' : 'ARCHIVED'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-1">
                          <button onClick={() => openHistory(product)} title="Stock history" className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-white/[0.06] dark:hover:text-white"><History className="h-4 w-4" /></button>
                          <button onClick={() => openEdit(product)} title="Edit" className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-white/[0.06] dark:hover:text-white"><Pencil className="h-4 w-4" /></button>
                          <button onClick={() => toggleArchive(product)} title={product.active !== false ? 'Archive' : 'Restore'} className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-white/[0.06] dark:hover:text-white">
                            {product.active !== false ? <Archive className="h-4 w-4" /> : <RotateCcw className="h-4 w-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-gray-100 dark:divide-white/[0.07] lg:hidden">
              {visibleProducts.map((product) => (
                <div key={product.id} className="p-4">
                  <div className="flex gap-3">
                    <img src={getImageUrl(product.image)} alt="" className="h-16 w-16 rounded-2xl object-cover" onError={(e) => { e.currentTarget.src = '/placeholder.png' }} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0"><p className="truncate text-sm font-black">{product.name}</p><p className="mt-1 text-[11px] text-gray-500">{product.category || 'Uncategorised'} · {money(product.price)}</p></div>
                        <span className={`rounded-full px-2 py-1 text-[9px] font-black ${product.active !== false ? 'bg-emerald-500/10 text-emerald-600' : 'bg-gray-500/10 text-gray-500'}`}>{product.active !== false ? 'LIVE' : 'ARCHIVED'}</span>
                      </div>
                      <button onClick={() => openStock(product)} className={`mt-3 inline-flex rounded-lg border px-2.5 py-1.5 text-xs font-black ${stockTone(product)}`}>{number(product.stock_quantity)} in stock</button>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    <button onClick={() => openStock(product)} className="rounded-xl bg-[#108910] px-3 py-2 text-[11px] font-black text-white">Adjust</button>
                    <button onClick={() => openEdit(product)} className="rounded-xl border border-gray-200 px-3 py-2 text-[11px] font-black dark:border-white/10">Edit</button>
                    <button onClick={() => openHistory(product)} className="rounded-xl border border-gray-200 px-3 py-2 text-[11px] font-black dark:border-white/10">History</button>
                  </div>
                </div>
              ))}
            </div>

            {!visibleProducts.length && <div className="px-6 py-16 text-center"><Package className="mx-auto h-8 w-8 text-gray-300" /><p className="mt-3 text-sm font-black">No products match this view</p><p className="mt-1 text-xs text-gray-500">Try another search or inventory filter.</p></div>}
          </section>
        </div>
      </main>

      {showForm && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-4" onMouseDown={(e) => e.target === e.currentTarget && closeForm()}>
          <div className="max-h-[94dvh] w-full overflow-y-auto rounded-t-3xl border border-gray-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#090909] sm:max-w-3xl sm:rounded-3xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white/95 px-5 py-4 backdrop-blur dark:border-white/10 dark:bg-[#090909]/95">
              <div><p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#108910]">Catalog record</p><h2 className="mt-1 text-xl font-black">{editing ? 'Edit product' : 'Add product'}</h2></div>
              <button onClick={closeForm} className="grid h-9 w-9 place-items-center rounded-xl bg-gray-100 dark:bg-white/[0.06]"><X className="h-4 w-4" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="sm:col-span-2"><span className="mb-1.5 block text-xs font-bold text-gray-600 dark:text-gray-400">Product name *</span><input required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input-field" placeholder="e.g. Hass Avocados" /></label>
                <label><span className="mb-1.5 block text-xs font-bold text-gray-600 dark:text-gray-400">Category</span><input list="marketmet-categories" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="input-field" placeholder="Produce" /><datalist id="marketmet-categories">{categories.map((category) => <option key={category} value={category} />)}</datalist></label>
                <label><span className="mb-1.5 block text-xs font-bold text-gray-600 dark:text-gray-400">SKU</span><input value={formData.sku} onChange={(e) => setFormData({ ...formData, sku: e.target.value })} className="input-field uppercase" placeholder="AVO-HASS-01" /></label>
                <label><span className="mb-1.5 block text-xs font-bold text-gray-600 dark:text-gray-400">Selling price (RWF) *</span><input required type="number" min="0" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="input-field" /></label>
                <label><span className="mb-1.5 block text-xs font-bold text-gray-600 dark:text-gray-400">Unit</span><select value={formData.unit} onChange={(e) => setFormData({ ...formData, unit: e.target.value })} className="input-field"><option value="item">Item</option><option value="kg">Kilogram</option><option value="pack">Pack</option><option value="bottle">Bottle</option><option value="box">Box</option><option value="bag">Bag</option><option value="tray">Tray</option></select></label>
                <label><span className="mb-1.5 block text-xs font-bold text-gray-600 dark:text-gray-400">Stock quantity</span><input type="number" min="0" value={formData.stock_quantity} onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })} className="input-field" /></label>
                <label><span className="mb-1.5 block text-xs font-bold text-gray-600 dark:text-gray-400">Low-stock alert at</span><input type="number" min="0" value={formData.low_stock_threshold} onChange={(e) => setFormData({ ...formData, low_stock_threshold: e.target.value })} className="input-field" /></label>
                <label className="sm:col-span-2"><span className="mb-1.5 block text-xs font-bold text-gray-600 dark:text-gray-400">Description</span><textarea rows="3" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="input-field min-h-24 resize-y" placeholder="A concise customer-facing description" /></label>
              </div>

              <div className="rounded-2xl border border-gray-200 p-4 dark:border-white/10">
                <div className="mb-3 flex items-center gap-2"><ImageIcon className="h-4 w-4 text-[#108910]" /><p className="text-xs font-black">Product image</p></div>
                <div className="grid gap-3 sm:grid-cols-[96px_1fr]">
                  <div className="grid h-24 w-24 place-items-center overflow-hidden rounded-2xl bg-gray-100 dark:bg-white/[0.05]">{formData.image ? <img src={getImageUrl(formData.image)} alt="Preview" className="h-full w-full object-cover" /> : <ImageIcon className="h-6 w-6 text-gray-300" />}</div>
                  <div className="space-y-2"><input value={formData.image} onChange={(e) => setFormData({ ...formData, image: e.target.value })} className="input-field" placeholder="Paste an image URL or upload below" /><label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-xs font-black transition hover:bg-gray-50 dark:border-white/10 dark:hover:bg-white/[0.05]"><Upload className="h-4 w-4" />{uploading ? 'Uploading…' : 'Upload image'}<input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} /></label></div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <label className="flex items-center gap-3 rounded-2xl border border-gray-200 p-3 dark:border-white/10"><input type="checkbox" checked={formData.active} onChange={(e) => setFormData({ ...formData, active: e.target.checked })} className="h-4 w-4 accent-[#108910]" /><div><p className="text-xs font-black">Visible</p><p className="text-[10px] text-gray-500">Show in storefront</p></div></label>
                <label className="flex items-center gap-3 rounded-2xl border border-gray-200 p-3 dark:border-white/10"><input type="checkbox" checked={formData.is_promo} onChange={(e) => setFormData({ ...formData, is_promo: e.target.checked })} className="h-4 w-4 accent-[#108910]" /><div><p className="text-xs font-black">Promotion</p><p className="text-[10px] text-gray-500">Feature as an offer</p></div></label>
                <div className="rounded-2xl border border-gray-200 p-3 dark:border-white/10"><p className="text-xs font-black">Status</p><p className="mt-1 text-[10px] text-gray-500">Stock availability updates automatically.</p></div>
              </div>

              {formData.is_promo && <div className="grid gap-4 sm:grid-cols-2"><label><span className="mb-1.5 block text-xs font-bold text-gray-600 dark:text-gray-400">Original price</span><input type="number" min="0" value={formData.original_price} onChange={(e) => setFormData({ ...formData, original_price: e.target.value })} className="input-field" /></label><label><span className="mb-1.5 block text-xs font-bold text-gray-600 dark:text-gray-400">Discount %</span><input type="number" min="0" max="100" value={formData.discount} onChange={(e) => setFormData({ ...formData, discount: e.target.value })} className="input-field" /></label></div>}

              <div className="flex flex-col-reverse gap-2 border-t border-gray-100 pt-5 dark:border-white/10 sm:flex-row sm:justify-end"><button type="button" onClick={closeForm} className="rounded-xl border border-gray-200 px-4 py-3 text-xs font-black dark:border-white/10">Cancel</button><button disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#108910] px-5 py-3 text-xs font-black text-white disabled:opacity-60">{saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}{editing ? 'Save changes' : 'Create product'}</button></div>
            </form>
          </div>
        </div>
      )}

      {stockProduct && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onMouseDown={(e) => e.target === e.currentTarget && setStockProduct(null)}>
          <form onSubmit={saveStock} className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-5 shadow-2xl dark:border-white/10 dark:bg-[#090909]">
            <div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#108910]">Inventory adjustment</p><h3 className="mt-1 text-xl font-black">{stockProduct.name}</h3><p className="mt-1 text-xs text-gray-500">Current balance: <strong>{number(stockProduct.stock_quantity)} {stockProduct.unit || 'item'}{Number(stockProduct.stock_quantity) === 1 ? '' : 's'}</strong></p></div><button type="button" onClick={() => setStockProduct(null)} className="grid h-9 w-9 place-items-center rounded-xl bg-gray-100 dark:bg-white/[0.06]"><X className="h-4 w-4" /></button></div>
            <div className="mt-5 grid grid-cols-2 gap-2"><button type="button" onClick={() => setStockForm({ ...stockForm, mode: 'delta', type: 'RECEIPT' })} className={`rounded-xl border px-3 py-2.5 text-xs font-black ${stockForm.mode === 'delta' ? 'border-[#108910] bg-[#108910]/10 text-[#108910]' : 'border-gray-200 dark:border-white/10'}`}>Add / remove</button><button type="button" onClick={() => setStockForm({ ...stockForm, mode: 'set', type: 'COUNT' })} className={`rounded-xl border px-3 py-2.5 text-xs font-black ${stockForm.mode === 'set' ? 'border-[#108910] bg-[#108910]/10 text-[#108910]' : 'border-gray-200 dark:border-white/10'}`}>Set exact balance</button></div>
            <label className="mt-4 block"><span className="mb-1.5 block text-xs font-bold text-gray-600 dark:text-gray-400">{stockForm.mode === 'set' ? 'New stock quantity' : 'Change quantity (+ add / − remove)'}</span><input autoFocus type="number" value={stockForm.quantity} onChange={(e) => setStockForm({ ...stockForm, quantity: e.target.value })} className="input-field text-lg font-black" placeholder={stockForm.mode === 'set' ? '24' : '+12'} /></label>
            <label className="mt-3 block"><span className="mb-1.5 block text-xs font-bold text-gray-600 dark:text-gray-400">Reason</span><select value={stockForm.type} onChange={(e) => setStockForm({ ...stockForm, type: e.target.value })} className="input-field"><option value="RECEIPT">Supplier receipt</option><option value="COUNT">Stock count</option><option value="ADJUSTMENT">Manual adjustment</option><option value="WASTE">Waste / damage</option><option value="RETURN">Customer return</option></select></label>
            <label className="mt-3 block"><span className="mb-1.5 block text-xs font-bold text-gray-600 dark:text-gray-400">Note</span><textarea rows="2" value={stockForm.note} onChange={(e) => setStockForm({ ...stockForm, note: e.target.value })} className="input-field min-h-20 resize-y" placeholder="Optional audit note" /></label>
            <button className="mt-5 w-full rounded-xl bg-[#108910] py-3 text-xs font-black text-white">Save inventory adjustment</button>
          </form>
        </div>
      )}

      {historyProduct && (
        <div className="fixed inset-0 z-[90] flex justify-end bg-black/70 backdrop-blur-sm" onMouseDown={(e) => e.target === e.currentTarget && setHistoryProduct(null)}>
          <div className="h-full w-full max-w-lg overflow-y-auto border-l border-gray-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#090909]">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white/95 p-5 backdrop-blur dark:border-white/10 dark:bg-[#090909]/95"><div><p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#108910]">Inventory audit trail</p><h3 className="mt-1 text-xl font-black">{historyProduct.name}</h3></div><button onClick={() => setHistoryProduct(null)} className="grid h-9 w-9 place-items-center rounded-xl bg-gray-100 dark:bg-white/[0.06]"><X className="h-4 w-4" /></button></div>
            <div className="p-5">
              {historyLoading ? <div className="py-16 text-center"><RefreshCw className="mx-auto h-5 w-5 animate-spin text-[#108910]" /></div> : history.length ? <div className="space-y-2">{history.map((movement) => <div key={movement.id} className="rounded-2xl border border-gray-200 p-4 dark:border-white/10"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-black">{String(movement.type).replaceAll('_', ' ')}</p><p className="mt-1 text-[11px] text-gray-500">{new Date(movement.created_at).toLocaleString()}</p></div><span className={`rounded-lg px-2.5 py-1 text-xs font-black ${movement.change > 0 ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'}`}>{movement.change > 0 ? '+' : ''}{movement.change}</span></div><div className="mt-3 flex items-center gap-2 text-xs font-bold text-gray-500"><span>{movement.quantity_before}</span><ChevronRight className="h-3.5 w-3.5" /><span className="text-gray-950 dark:text-white">{movement.quantity_after}</span></div>{movement.note && <p className="mt-2 text-xs leading-5 text-gray-500">{movement.note}</p>}</div>)}</div> : <div className="py-16 text-center"><History className="mx-auto h-7 w-7 text-gray-300" /><p className="mt-3 text-sm font-black">No inventory movements yet</p></div>}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Products
