"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination"
import { Lock, Download, Search, Eye, X, Trash2, Mail, LogOut, FilterX } from "lucide-react"
import HandbookAdmin from "@/components/admin/handbook-admin"

interface Registration {
  id: string
  firstname: string
  lastname: string
  email: string
  phone: string
  company: string
  position: string
  sector: string
  nation: string
  residence: string
  gender: string
  birth: string
  passportno: string
  visa: string
  passport_img?: string
  img?: string
  payment_status: string
  is_invite?: boolean
  is_vip?: boolean
  ygl_spouse?: string
  ygl_spouse_of?: string
  created_at: string
  fee_amount: number
  fee_currency: string
  fee_usd_amount?: number
  fee_exchange_rate?: number
}

const PWD_KEY = "mef_admin_pwd"
const UI_KEY = "mef_admin_ui_v1"
const PAGE_SIZES = [25, 50, 100, 200]

type Tier = "regular" | "invite" | "vip"
function tierOf(r: Registration): Tier {
  return r.is_vip ? "vip" : r.is_invite ? "invite" : "regular"
}

// Local calendar date (yyyy-mm-dd) of an ISO timestamp, or null if unparseable.
function localDate(iso?: string): string | null {
  if (!iso) return null
  const dt = new Date(iso)
  if (isNaN(dt.getTime())) return null
  const y = dt.getFullYear()
  const m = String(dt.getMonth() + 1).padStart(2, "0")
  const d = String(dt.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

function nameKey(r: Registration): string {
  return `${r.lastname || ""} ${r.firstname || ""}`.trim().toLowerCase()
}

export default function AdminPage() {
  // --- Auth ---
  const [password, setPassword] = useState("")
  const [authenticated, setAuthenticated] = useState(false)
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // --- Filters / sort / pagination ---
  const [search, setSearch] = useState("")
  const [paymentStatus, setPaymentStatus] = useState("all")
  const [type, setType] = useState("all")
  const [sector, setSector] = useState("all")
  const [nation, setNation] = useState("all")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [sort, setSort] = useState("newest")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(50)

  // Gate the persist-write effect so the initial mount doesn't overwrite
  // stored state with defaults before hydration runs.
  const [hydrated, setHydrated] = useState(false)

  // --- Modals / menus ---
  const [viewingImages, setViewingImages] = useState<{ name: string; passportUrl?: string; photoUrl?: string } | null>(null)
  const [imgLoading, setImgLoading] = useState(false)
  const [emailMenuId, setEmailMenuId] = useState<string | null>(null)
  const [sendingEmail, setSendingEmail] = useState(false)

  const fetchRegistrations = async (pwd: string) => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/admin/registrations", {
        headers: { "x-admin-password": pwd },
      })
      if (res.status === 401) {
        setError("Wrong password")
        setAuthenticated(false)
        try { sessionStorage.removeItem(PWD_KEY) } catch {}
        return
      }
      if (!res.ok) throw new Error("Failed to fetch")
      const data = await res.json()
      setRegistrations(data.registrations)
      setAuthenticated(true)
      try { sessionStorage.setItem(PWD_KEY, pwd) } catch {}
    } catch {
      setError("Failed to load registrations")
    } finally {
      setLoading(false)
    }
  }

  // --- Mount: hydrate UI state (localStorage) + auth (sessionStorage) ---
  useEffect(() => {
    try {
      const raw = localStorage.getItem(UI_KEY)
      if (raw) {
        const s = JSON.parse(raw)
        if (typeof s.search === "string") setSearch(s.search)
        if (typeof s.paymentStatus === "string") setPaymentStatus(s.paymentStatus)
        if (typeof s.type === "string") setType(s.type)
        if (typeof s.sector === "string") setSector(s.sector)
        if (typeof s.nation === "string") setNation(s.nation)
        if (typeof s.dateFrom === "string") setDateFrom(s.dateFrom)
        if (typeof s.dateTo === "string") setDateTo(s.dateTo)
        if (typeof s.sort === "string") setSort(s.sort)
        if (PAGE_SIZES.includes(s.pageSize)) setPageSize(s.pageSize)
        if (Number.isInteger(s.page) && s.page >= 1) setPage(s.page)
      }
    } catch {}

    let storedPwd: string | null = null
    try { storedPwd = sessionStorage.getItem(PWD_KEY) } catch {}
    if (storedPwd) {
      setPassword(storedPwd)
      fetchRegistrations(storedPwd)
    }
    setHydrated(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // --- Persist UI state (only after hydration) ---
  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem(
        UI_KEY,
        JSON.stringify({ search, paymentStatus, type, sector, nation, dateFrom, dateTo, sort, page, pageSize })
      )
    } catch {}
  }, [hydrated, search, paymentStatus, type, sector, nation, dateFrom, dateTo, sort, page, pageSize])

  // --- Dynamic filter option lists ---
  const sectorOptions = useMemo(() => {
    const set = new Set<string>()
    registrations.forEach((r) => { if (r.sector) set.add(r.sector) })
    if (sector !== "all" && !set.has(sector)) set.add(sector)
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [registrations, sector])

  const nationOptions = useMemo(() => {
    const set = new Set<string>()
    registrations.forEach((r) => { if (r.nation) set.add(r.nation) })
    if (nation !== "all" && !set.has(nation)) set.add(nation)
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [registrations, nation])

  // --- Filter → sort pipeline ---
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    const qRaw = search.trim()
    const rows = registrations.filter((r) => {
      if (q) {
        const text = [r.firstname, r.lastname, r.email, r.company, r.position]
          .some((v) => (v || "").toLowerCase().includes(q))
        const phone = (r.phone || "").includes(qRaw)
        if (!text && !phone) return false
      }
      if (paymentStatus !== "all" && r.payment_status !== paymentStatus) return false
      if (type !== "all" && tierOf(r) !== type) return false
      if (sector !== "all" && r.sector !== sector) return false
      if (nation !== "all" && r.nation !== nation) return false
      if (dateFrom || dateTo) {
        const d = localDate(r.created_at)
        if (!d) return false
        if (dateFrom && d < dateFrom) return false
        if (dateTo && d > dateTo) return false
      }
      return true
    })

    const byNewest = (a: Registration, b: Registration) =>
      (b.created_at || "").localeCompare(a.created_at || "")
    const sorted = [...rows]
    switch (sort) {
      case "oldest":
        sorted.sort((a, b) => (a.created_at || "").localeCompare(b.created_at || ""))
        break
      case "name_asc":
        sorted.sort((a, b) => nameKey(a).localeCompare(nameKey(b)) || byNewest(a, b))
        break
      case "name_desc":
        sorted.sort((a, b) => nameKey(b).localeCompare(nameKey(a)) || byNewest(a, b))
        break
      case "status":
        sorted.sort((a, b) => {
          const rank = (r: Registration) => (r.payment_status === "paid" ? 0 : 1)
          return rank(a) - rank(b) || byNewest(a, b)
        })
        break
      default:
        sorted.sort(byNewest)
    }
    return sorted
  }, [registrations, search, paymentStatus, type, sector, nation, dateFrom, dateTo, sort])

  // --- Pagination math (derived) ---
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const start = (safePage - 1) * pageSize
  const pageRows = filtered.slice(start, start + pageSize)
  const showingFrom = filtered.length === 0 ? 0 : start + 1
  const showingTo = Math.min(start + pageSize, filtered.length)

  // Clamp the page if it falls out of range (deletes / refetch / stale persisted page).
  useEffect(() => {
    if (registrations.length === 0) return
    if (page > totalPages) setPage(totalPages)
  }, [registrations.length, totalPages, page])

  // Close any open email menu when the visible slice changes (page / filter / sort),
  // so it can't silently reopen on a row that scrolls back into view.
  useEffect(() => {
    setEmailMenuId(null)
  }, [safePage, search, paymentStatus, type, sector, nation, dateFrom, dateTo, sort, pageSize])

  // --- Stats ---
  const totalPaid = registrations.filter((r) => r.payment_status === "paid").length
  const totalPending = registrations.length - totalPaid
  const filteredPaid = filtered.filter((r) => r.payment_status === "paid").length
  const filteredPending = filtered.length - filteredPaid

  const activeFilterCount = [
    search.trim() !== "",
    paymentStatus !== "all",
    type !== "all",
    sector !== "all",
    nation !== "all",
    dateFrom !== "",
    dateTo !== "",
  ].filter(Boolean).length

  const clearFilters = () => {
    setSearch("")
    setPaymentStatus("all")
    setType("all")
    setSector("all")
    setNation("all")
    setDateFrom("")
    setDateTo("")
    setPage(1)
  }

  const logout = () => {
    setAuthenticated(false)
    setPassword("")
    setRegistrations([])
    setError("")
    setEmailMenuId(null)
    setViewingImages(null)
    try { sessionStorage.removeItem(PWD_KEY) } catch {}
  }

  const handleSendEmail = async (id: string, emailType: "confirmation" | "invoice") => {
    setSendingEmail(true)
    setEmailMenuId(null)
    try {
      const res = await fetch("/api/admin/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-password": password },
        body: JSON.stringify({ id, type: emailType }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed")
      }
      const data = await res.json()
      alert(`Email sent to ${data.email}`)
    } catch (err: any) {
      alert(`Failed to send email: ${err.message}`)
    } finally {
      setSendingEmail(false)
    }
  }

  const viewImages = async (r: Registration) => {
    setImgLoading(true)
    setViewingImages({ name: `${r.firstname} ${r.lastname}` })
    try {
      const urls: { passportUrl?: string; photoUrl?: string } = {}
      if (r.passport_img) {
        const res = await fetch(`/api/admin/image?key=${encodeURIComponent(r.passport_img)}`, {
          headers: { "x-admin-password": password },
        })
        if (res.ok) urls.passportUrl = (await res.json()).url
      }
      if (r.img) {
        const res = await fetch(`/api/admin/image?key=${encodeURIComponent(r.img)}`, {
          headers: { "x-admin-password": password },
        })
        if (res.ok) urls.photoUrl = (await res.json()).url
      }
      setViewingImages({ name: `${r.firstname} ${r.lastname}`, ...urls })
    } catch {
      setViewingImages(null)
    } finally {
      setImgLoading(false)
    }
  }

  const handleDelete = async (r: Registration) => {
    if (!confirm(`Delete registration for ${r.firstname} ${r.lastname}?`)) return
    try {
      const res = await fetch("/api/admin/registrations/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-password": password },
        body: JSON.stringify({ id: r.id }),
      })
      if (!res.ok) throw new Error("Failed to delete")
      setRegistrations((prev) => prev.filter((reg) => reg.id !== r.id))
    } catch {
      alert("Failed to delete registration")
    }
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    fetchRegistrations(password)
  }

  const exportCSV = () => {
    const headers = [
      "ID", "First Name", "Last Name", "Email", "Phone", "Company",
      "Position", "Sector", "Nationality", "Residence", "Gender",
      "Date of Birth", "Passport No", "Visa Needed", "Payment Status",
      "Type", "YGL Spouse", "Accompanying YGL", "Fee", "Currency", "Registered At",
    ]
    const rows = filtered.map((r) => [
      r.id, r.firstname, r.lastname, r.email, r.phone, r.company,
      r.position, r.sector, r.nation, r.residence, r.gender,
      r.birth, r.passportno, r.visa, r.payment_status,
      tierOf(r), r.ygl_spouse, r.ygl_spouse_of, r.fee_amount, r.fee_currency, r.created_at,
    ])
    const csv = [headers, ...rows].map((row) =>
      row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(",")
    ).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `mef-registrations-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Windowed page-number list with ellipses.
  const pageItems = useMemo<(number | string)[]>(() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
    const wanted = [1, totalPages, safePage, safePage - 1, safePage + 1]
      .filter((n) => n >= 1 && n <= totalPages)
    const uniqueSorted = Array.from(new Set(wanted)).sort((a, b) => a - b)
    const out: (number | string)[] = []
    let prev = 0
    for (const n of uniqueSorted) {
      if (n - prev > 1) out.push(`gap-${n}`)
      out.push(n)
      prev = n
    }
    return out
  }, [totalPages, safePage])

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary/30 px-4">
        <Card className="w-full max-w-sm rounded-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-3 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Lock className="w-5 h-5 text-primary" />
            </div>
            <CardTitle>Admin Access</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                type="password"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Checking..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  const dateInputClass =
    "h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"

  return (
    <div className="min-h-screen bg-secondary/30">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold">MEF Registrations</h1>
            <p className="text-sm text-muted-foreground">
              {registrations.length} total — {totalPaid} paid, {totalPending} pending
              {activeFilterCount > 0 && (
                <span className="text-primary">
                  {" · "}
                  {filtered.length} filtered ({filteredPaid} paid, {filteredPending} pending)
                </span>
              )}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => fetchRegistrations(password)} disabled={loading}>
              {loading ? "Refreshing..." : "Refresh"}
            </Button>
            <Button size="sm" onClick={exportCSV}>
              <Download className="w-4 h-4 mr-1" />
              Export CSV
            </Button>
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="w-4 h-4 mr-1" />
              Logout
            </Button>
          </div>
        </div>

        {/* Handbook management */}
        <HandbookAdmin password={password} />

        {/* Filters */}
        <div className="mb-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, company, position, phone..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="pl-9"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Select value={paymentStatus} onValueChange={(v) => { setPaymentStatus(v); setPage(1) }}>
              <SelectTrigger size="sm" className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>

            <Select value={type} onValueChange={(v) => { setType(v); setPage(1) }}>
              <SelectTrigger size="sm" className="w-[130px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="regular">Regular</SelectItem>
                <SelectItem value="invite">Invite</SelectItem>
                <SelectItem value="vip">VIP</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sector} onValueChange={(v) => { setSector(v); setPage(1) }}>
              <SelectTrigger size="sm" className="w-[160px]">
                <SelectValue placeholder="Sector" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All sectors</SelectItem>
                {sectorOptions.map((s) => (
                  <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={nation} onValueChange={(v) => { setNation(v); setPage(1) }}>
              <SelectTrigger size="sm" className="w-[160px]">
                <SelectValue placeholder="Nationality" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All nationalities</SelectItem>
                {nationOptions.map((n) => (
                  <SelectItem key={n} value={n}>{n}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-1">
              <input
                type="date"
                aria-label="Registered from"
                value={dateFrom}
                onChange={(e) => { setDateFrom(e.target.value); setPage(1) }}
                className={dateInputClass}
              />
              <span className="text-muted-foreground text-sm">–</span>
              <input
                type="date"
                aria-label="Registered to"
                value={dateTo}
                onChange={(e) => { setDateTo(e.target.value); setPage(1) }}
                className={dateInputClass}
              />
            </div>

            <Select value={sort} onValueChange={(v) => { setSort(v); setPage(1) }}>
              <SelectTrigger size="sm" className="w-[150px]">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest first</SelectItem>
                <SelectItem value="oldest">Oldest first</SelectItem>
                <SelectItem value="name_asc">Name A–Z</SelectItem>
                <SelectItem value="name_desc">Name Z–A</SelectItem>
                <SelectItem value="status">Status (paid first)</SelectItem>
              </SelectContent>
            </Select>

            {activeFilterCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <FilterX className="w-4 h-4 mr-1" />
                Clear ({activeFilterCount})
              </Button>
            )}
          </div>
        </div>

        <div className="rounded-xl border bg-background overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-3 font-medium">#</th>
                <th className="text-left p-3 font-medium">Name</th>
                <th className="text-left p-3 font-medium">Email</th>
                <th className="text-left p-3 font-medium">Phone</th>
                <th className="text-left p-3 font-medium">Company</th>
                <th className="text-left p-3 font-medium">Sector</th>
                <th className="text-left p-3 font-medium">Nation</th>
                <th className="text-left p-3 font-medium">Fee</th>
                <th className="text-left p-3 font-medium">Status</th>
                <th className="text-left p-3 font-medium">Type</th>
                <th className="text-left p-3 font-medium">Photos</th>
                <th className="text-left p-3 font-medium">Date</th>
                <th className="text-left p-3 font-medium">Email</th>
                <th className="text-left p-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((r, i) => (
                <tr key={r.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="p-3 text-muted-foreground">{start + i + 1}</td>
                  <td className="p-3 font-medium whitespace-nowrap">
                    {r.firstname} {r.lastname}
                  </td>
                  <td className="p-3">{r.email}</td>
                  <td className="p-3 whitespace-nowrap">{r.phone}</td>
                  <td className="p-3">{r.company}</td>
                  <td className="p-3 capitalize">{r.sector}</td>
                  <td className="p-3">{r.nation}</td>
                  <td className="p-3 whitespace-nowrap">
                    {!r.fee_amount ? (
                      <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        free
                      </span>
                    ) : (
                      <>
                        {r.fee_currency === "USD" ? "$" : "₮"}
                        {r.fee_amount?.toLocaleString()}
                        {r.fee_usd_amount && (
                          <span className="block text-xs text-muted-foreground">
                            (${r.fee_usd_amount} × {r.fee_exchange_rate?.toLocaleString()})
                          </span>
                        )}
                      </>
                    )}
                  </td>
                  <td className="p-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                        r.payment_status === "paid"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {r.payment_status}
                    </span>
                  </td>
                  <td className="p-3">
                    {r.is_vip ? (
                      <span
                        className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700 whitespace-nowrap"
                        title={r.ygl_spouse === "yes" && r.ygl_spouse_of ? `Spouse of ${r.ygl_spouse_of}` : undefined}
                      >
                        {r.ygl_spouse === "yes" ? "vip spouse" : "vip"}
                      </span>
                    ) : r.is_invite ? (
                      <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                        invite
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </td>
                  <td className="p-3">
                    {(r.passport_img || r.img) ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2"
                        onClick={() => viewImages(r)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </td>
                  <td className="p-3 whitespace-nowrap text-muted-foreground">
                    {r.created_at ? new Date(r.created_at).toLocaleDateString() : ""}
                  </td>
                  <td className="p-3 relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2"
                      disabled={sendingEmail}
                      onClick={() => setEmailMenuId(emailMenuId === r.id ? null : r.id)}
                    >
                      <Mail className="w-4 h-4" />
                    </Button>
                    {emailMenuId === r.id && (
                      <div className="absolute right-0 top-full z-10 bg-background border rounded-lg shadow-lg py-1 min-w-[180px]">
                        <button
                          className="w-full text-left px-3 py-2 text-sm hover:bg-muted"
                          onClick={() => handleSendEmail(r.id, "confirmation")}
                        >
                          Send Confirmation
                        </button>
                        <button
                          className="w-full text-left px-3 py-2 text-sm hover:bg-muted"
                          onClick={() => handleSendEmail(r.id, "invoice")}
                        >
                          Send Invoice (PDF)
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="p-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(r)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={14} className="p-8 text-center text-muted-foreground">
                    {registrations.length === 0 ? (
                      "No registrations yet"
                    ) : (
                      <span className="inline-flex items-center gap-3">
                        No registrations match your filters
                        <Button variant="outline" size="sm" onClick={clearFilters}>
                          <FilterX className="w-4 h-4 mr-1" />
                          Clear filters
                        </Button>
                      </span>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer: count + page size + pagination */}
        {filtered.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
            <p className="text-sm text-muted-foreground">
              Showing {showingFrom}–{showingTo} of {filtered.length}
            </p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Rows</span>
                <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setPage(1) }}>
                  <SelectTrigger size="sm" className="w-[80px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAGE_SIZES.map((n) => (
                      <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {totalPages > 1 && (
                <Pagination className="mx-0 w-auto">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        className={safePage <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        aria-disabled={safePage <= 1}
                        onClick={(e) => { e.preventDefault(); if (safePage > 1) setPage(safePage - 1) }}
                      />
                    </PaginationItem>
                    {pageItems.map((it) =>
                      typeof it === "string" ? (
                        <PaginationItem key={it}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      ) : (
                        <PaginationItem key={it}>
                          <PaginationLink
                            href="#"
                            className="cursor-pointer"
                            isActive={it === safePage}
                            onClick={(e) => { e.preventDefault(); setPage(it) }}
                          >
                            {it}
                          </PaginationLink>
                        </PaginationItem>
                      )
                    )}
                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        className={safePage >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        aria-disabled={safePage >= totalPages}
                        onClick={(e) => { e.preventDefault(); if (safePage < totalPages) setPage(safePage + 1) }}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </div>
          </div>
        )}

        {/* Image viewer modal */}
        {viewingImages && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setViewingImages(null)}>
            <div className="bg-background rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg">{viewingImages.name}</h3>
                <Button variant="ghost" size="sm" onClick={() => setViewingImages(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              {imgLoading ? (
                <p className="text-center text-muted-foreground py-8">Loading images...</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium mb-2">Passport Photo</p>
                    {viewingImages.passportUrl ? (
                      <img src={viewingImages.passportUrl} alt="Passport" className="w-full rounded-lg border object-contain max-h-80" />
                    ) : (
                      <div className="w-full h-40 rounded-lg border flex items-center justify-center text-muted-foreground text-sm">No image</div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">Profile Photo</p>
                    {viewingImages.photoUrl ? (
                      <img src={viewingImages.photoUrl} alt="Profile" className="w-full rounded-lg border object-contain max-h-80" />
                    ) : (
                      <div className="w-full h-40 rounded-lg border flex items-center justify-center text-muted-foreground text-sm">No image</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
