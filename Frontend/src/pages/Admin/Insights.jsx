import { useEffect, useMemo, useState } from 'react'
import {
  Archive,
  Edit3,
  Eye,
  FileText,
  Image as ImageIcon,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
  Upload,
  X,
} from 'lucide-react'
import AdminSidebar from '../../components/AdminSidebar'
import { insightsAPI, productsAPI } from '../../services/api'
import { useToast } from '../../contexts/ToastContext'

const EMPTY = {
  title: '',
  excerpt: '',
  content: '',
  category: 'MarketMet Guide',
  image: '',
  author: 'MarketMet Editorial',
  featured: false,
  published: true,
}

const InsightsAdmin = () => {
  const toast = useToast()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('ALL')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => { loadPosts() }, [])

  const loadPosts = async ({ silent = false } = {}) => {
    silent ? setRefreshing(true) : setLoading(true)
    try {
      const response = await insightsAPI.getAdmin()
      setPosts(Array.isArray(response.data) ? response.data : [])
    } catch (error) {
      console.error('Insights load failed:', error)
      toast.error(error.response?.data?.error || 'Could not load Insights')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const metrics = useMemo(() => ({
    total: posts.length,
    published: posts.filter((post) => post.published).length,
    drafts: posts.filter((post) => !post.published).length,
    featured: posts.filter((post) => post.featured).length,
  }), [posts])

  const visible = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return posts.filter((post) => {
      if (filter === 'PUBLISHED' && !post.published) return false
      if (filter === 'DRAFTS' && post.published) return false
      if (filter === 'FEATURED' && !post.featured) return false
      if (!normalized) return true
      return [post.title, post.category, post.author].filter(Boolean).some((value) => value.toLowerCase().includes(normalized))
    })
  }, [posts, query, filter])

  const openCreate = () => {
    setEditing(null)
    setForm(EMPTY)
    setShowForm(true)
  }

  const openEdit = (post) => {
    setEditing(post)
    setForm({
      title: post.title || '',
      excerpt: post.excerpt || '',
      content: post.content || '',
      category: post.category || 'MarketMet Guide',
      image: post.image || '',
      author: post.author || 'MarketMet Editorial',
      featured: Boolean(post.featured),
      published: Boolean(post.published),
    })
    setShowForm(true)
  }

  const closeForm = () => {
    if (saving) return
    setShowForm(false)
    setEditing(null)
    setForm(EMPTY)
  }

  const save = async (event) => {
    event.preventDefault()
    if (!form.title.trim() || !form.content.trim()) return toast.warning('Title and article content are required')
    setSaving(true)
    try {
      if (editing) {
        await insightsAPI.update(editing.id, form)
        toast.success('Insight updated')
      } else {
        await insightsAPI.create(form)
        toast.success('Insight created')
      }
      closeForm()
      await loadPosts({ silent: true })
    } catch (error) {
      toast.error(error.response?.data?.error || 'Could not save insight')
    } finally {
      setSaving(false)
    }
  }

  const remove = async (post) => {
    if (!window.confirm(`Delete “${post.title}”? This cannot be undone.`)) return
    try {
      await insightsAPI.delete(post.id)
      toast.success('Insight deleted')
      await loadPosts({ silent: true })
    } catch (error) {
      toast.error(error.response?.data?.error || 'Could not delete insight')
    }
  }

  const quickToggle = async (post, patch) => {
    try {
      await insightsAPI.update(post.id, patch)
      await loadPosts({ silent: true })
      toast.success(patch.published === false ? 'Moved to draft' : patch.published === true ? 'Published' : 'Featured insight updated')
    } catch (error) {
      toast.error(error.response?.data?.error || 'Could not update insight')
    }
  }

  const uploadImage = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) return toast.warning('Choose an image file')
    if (file.size > 20 * 1024 * 1024) return toast.warning('Image must be under 20 MB')
    setUploading(true)
    try {
      const response = await productsAPI.uploadImage(file)
      setForm((current) => ({ ...current, image: response.data.url }))
      toast.success('Cover image uploaded')
    } catch (error) {
      toast.error(error.response?.data?.error || 'Image upload failed')
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return <div className="flex min-h-screen bg-[#F5F6F7] dark:bg-black"><AdminSidebar /><main className="flex-1 px-4 pb-10 pt-20 sm:px-6 lg:px-8 lg:py-8"><div className="mx-auto max-w-[1600px] animate-pulse space-y-5"><div className="h-20 rounded-2xl bg-gray-200 dark:bg-[#080808]" /><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[1,2,3,4].map((i) => <div key={i} className="h-28 rounded-2xl bg-gray-200 dark:bg-[#080808]" />)}</div><div className="h-[480px] rounded-2xl bg-gray-200 dark:bg-[#080808]" /></div></main></div>
  }

  return (
    <div className="flex min-h-screen bg-[#F5F6F7] text-gray-950 dark:bg-black dark:text-white">
      <AdminSidebar />
      <main className="min-w-0 flex-1">
        <div className="mx-auto max-w-[1600px] px-4 pb-12 pt-20 sm:px-6 lg:px-8 lg:py-7">
          <header className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"><div><p className="text-sm font-medium text-gray-500">Editorial content</p><h1 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">Insights manager</h1><p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">Publish market guides, freshness advice and shopping intelligence without changing website code.</p></div><div className="flex gap-2"><button onClick={() => loadPosts({ silent: true })} disabled={refreshing} className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs font-black text-gray-700 shadow-sm disabled:opacity-60 dark:border-white/10 dark:bg-[#080808] dark:text-gray-300"><RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} /> Refresh</button><button onClick={openCreate} className="inline-flex items-center gap-2 rounded-xl bg-[#108910] px-4 py-2.5 text-xs font-black text-white"><Plus className="h-4 w-4" /> New insight</button></div></header>

          <section className="mb-5 grid grid-cols-2 gap-3 xl:grid-cols-4">{[['Articles', metrics.total, FileText], ['Published', metrics.published, Eye], ['Drafts', metrics.drafts, Archive], ['Featured', metrics.featured, Sparkles]].map(([label, value, Icon]) => <div key={label} className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-white/10 dark:bg-[#080808]"><div className="flex items-start justify-between"><div><p className="text-[10px] font-black uppercase tracking-[0.12em] text-gray-400">{label}</p><p className="mt-2 text-2xl font-black">{value}</p></div><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#108910]/10 text-[#108910]"><Icon className="h-4 w-4" /></span></div></div>)}</section>

          <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_10px_30px_rgba(16,24,40,0.04)] dark:border-white/10 dark:bg-[#080808] dark:shadow-none">
            <div className="flex flex-col gap-3 border-b border-gray-100 p-4 dark:border-white/10 lg:flex-row lg:items-center lg:justify-between"><div className="relative w-full lg:max-w-md"><Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search title, category or author" className="w-full rounded-xl border border-gray-200 bg-[#F7F8F8] py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#108910] dark:border-white/10 dark:bg-[#0D0D0D]" /></div><div className="flex gap-2 overflow-x-auto">{[['ALL','All'],['PUBLISHED','Published'],['DRAFTS','Drafts'],['FEATURED','Featured']].map(([value,label]) => <button key={value} onClick={() => setFilter(value)} className={`whitespace-nowrap rounded-full px-3 py-1.5 text-[11px] font-black ${filter === value ? 'bg-gray-950 text-white dark:bg-white dark:text-black' : 'bg-gray-100 text-gray-600 dark:bg-white/[0.06] dark:text-gray-400'}`}>{label}</button>)}</div></div>

            <div className="divide-y divide-gray-100 dark:divide-white/[0.07]">{visible.length ? visible.map((post) => <article key={post.id} className="grid gap-4 p-4 sm:grid-cols-[120px_1fr_auto] sm:items-center sm:p-5"><div className="h-24 overflow-hidden rounded-2xl bg-gray-100 dark:bg-white/[0.05]">{post.image ? <img src={post.image} alt="" className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center"><ImageIcon className="h-6 w-6 text-gray-300" /></div>}</div><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-[#108910]/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.08em] text-[#108910]">{post.category || 'Insight'}</span>{post.featured && <span className="rounded-full bg-orange-500/10 px-2.5 py-1 text-[9px] font-black text-orange-600">FEATURED</span>}<span className={`rounded-full px-2.5 py-1 text-[9px] font-black ${post.published ? 'bg-emerald-500/10 text-emerald-600' : 'bg-gray-500/10 text-gray-500'}`}>{post.published ? 'PUBLISHED' : 'DRAFT'}</span></div><h2 className="mt-2 truncate text-base font-black">{post.title}</h2><p className="mt-1 line-clamp-2 text-xs leading-5 text-gray-500">{post.excerpt || post.content}</p><p className="mt-2 text-[10px] text-gray-400">{post.author || 'MarketMet Editorial'} · {new Date(post.updated_at || post.created_at).toLocaleDateString()}</p></div><div className="flex items-center gap-1 sm:flex-col"><button onClick={() => openEdit(post)} title="Edit" className="grid h-9 w-9 place-items-center rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-white/[0.06]"><Edit3 className="h-4 w-4" /></button><button onClick={() => quickToggle(post, { published: !post.published })} title={post.published ? 'Move to draft' : 'Publish'} className="grid h-9 w-9 place-items-center rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-white/[0.06]">{post.published ? <Archive className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button><button onClick={() => remove(post)} title="Delete" className="grid h-9 w-9 place-items-center rounded-xl text-red-500 hover:bg-red-500/10"><Trash2 className="h-4 w-4" /></button></div></article>) : <div className="px-6 py-16 text-center"><FileText className="mx-auto h-8 w-8 text-gray-300" /><p className="mt-3 text-sm font-black">No insights match this view</p></div>}</div>
          </section>
        </div>
      </main>

      {showForm && <div className="fixed inset-0 z-[90] flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-4" onMouseDown={(e) => e.target === e.currentTarget && closeForm()}><div className="max-h-[95dvh] w-full overflow-y-auto rounded-t-3xl border border-gray-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#090909] sm:max-w-4xl sm:rounded-3xl"><div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-gray-100 bg-white/95 px-5 py-4 backdrop-blur dark:border-white/10 dark:bg-[#090909]/95"><div><p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#108910]">Editorial workspace</p><h2 className="mt-1 text-xl font-black">{editing ? 'Edit insight' : 'Create insight'}</h2></div><button onClick={closeForm} className="grid h-9 w-9 place-items-center rounded-xl bg-gray-100 dark:bg-white/[0.06]"><X className="h-4 w-4" /></button></div><form onSubmit={save} className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[1fr_300px]"><div className="space-y-4"><label><span className="mb-1.5 block text-xs font-bold text-gray-600 dark:text-gray-400">Title *</span><input autoFocus required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-field text-lg font-black" placeholder="Write a useful, specific headline" /></label><label><span className="mb-1.5 block text-xs font-bold text-gray-600 dark:text-gray-400">Short summary</span><textarea rows="3" value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} className="input-field min-h-24 resize-y" placeholder="A concise description used on cards and previews" /></label><label><span className="mb-1.5 block text-xs font-bold text-gray-600 dark:text-gray-400">Article content *</span><textarea required rows="14" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="input-field min-h-[360px] resize-y leading-7" placeholder="Write the full article here. Use blank lines to separate paragraphs." /></label></div><aside className="space-y-4"><div className="rounded-2xl border border-gray-200 p-4 dark:border-white/10"><p className="text-xs font-black">Publishing</p><label className="mt-3 block"><span className="mb-1.5 block text-[11px] font-bold text-gray-500">Category</span><input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input-field" /></label><label className="mt-3 block"><span className="mb-1.5 block text-[11px] font-bold text-gray-500">Author</span><input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} className="input-field" /></label><label className="mt-3 flex items-center gap-3 rounded-xl bg-gray-50 p-3 dark:bg-white/[0.04]"><input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} className="h-4 w-4 accent-[#108910]" /><div><p className="text-xs font-black">Published</p><p className="text-[10px] text-gray-500">Visible to customers</p></div></label><label className="mt-2 flex items-center gap-3 rounded-xl bg-gray-50 p-3 dark:bg-white/[0.04]"><input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="h-4 w-4 accent-[#108910]" /><div><p className="text-xs font-black">Featured</p><p className="text-[10px] text-gray-500">Highlight at top of Insights</p></div></label></div><div className="rounded-2xl border border-gray-200 p-4 dark:border-white/10"><p className="text-xs font-black">Cover image</p><div className="mt-3 aspect-[16/10] overflow-hidden rounded-xl bg-gray-100 dark:bg-white/[0.05]">{form.image ? <img src={form.image} alt="Cover preview" className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center"><ImageIcon className="h-7 w-7 text-gray-300" /></div>}</div><input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className="input-field mt-3" placeholder="Image URL" /><label className="mt-2 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-[11px] font-black dark:border-white/10"><Upload className="h-4 w-4" />{uploading ? 'Uploading…' : 'Upload cover'}<input type="file" accept="image/*" onChange={uploadImage} className="hidden" disabled={uploading} /></label></div><button disabled={saving} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#108910] py-3 text-xs font-black text-white disabled:opacity-60">{saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}{editing ? 'Save article' : 'Publish article'}</button></aside></form></div></div>}
    </div>
  )
}

export default InsightsAdmin
