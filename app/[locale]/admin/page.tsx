"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Lock, Download, Search, Eye, X, Trash2 } from "lucide-react"

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
  created_at: string
  fee_amount: number
  fee_currency: string
  fee_usd_amount?: number
  fee_exchange_rate?: number
}

export default function AdminPage() {
  const [password, setPassword] = useState("")
  const [authenticated, setAuthenticated] = useState(false)
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [viewingImages, setViewingImages] = useState<{ name: string; passportUrl?: string; photoUrl?: string } | null>(null)
  const [imgLoading, setImgLoading] = useState(false)

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
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": password,
        },
        body: JSON.stringify({ id: r.id }),
      })
      if (!res.ok) throw new Error("Failed to delete")
      setRegistrations((prev) => prev.filter((reg) => reg.id !== r.id))
    } catch {
      alert("Failed to delete registration")
    }
  }

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
        return
      }
      if (!res.ok) throw new Error("Failed to fetch")
      const data = await res.json()
      setRegistrations(data.registrations)
      setAuthenticated(true)
    } catch {
      setError("Failed to load registrations")
    } finally {
      setLoading(false)
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
      "Invite", "Fee", "Currency", "Registered At",
    ]
    const rows = registrations.map((r) => [
      r.id, r.firstname, r.lastname, r.email, r.phone, r.company,
      r.position, r.sector, r.nation, r.residence, r.gender,
      r.birth, r.passportno, r.visa, r.payment_status,
      r.is_invite ? "yes" : "no", r.fee_amount, r.fee_currency, r.created_at,
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

  const filtered = registrations.filter((r) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      r.firstname?.toLowerCase().includes(q) ||
      r.lastname?.toLowerCase().includes(q) ||
      r.email?.toLowerCase().includes(q) ||
      r.company?.toLowerCase().includes(q) ||
      r.phone?.includes(q)
    )
  })

  const paidCount = registrations.filter((r) => r.payment_status === "paid").length
  const pendingCount = registrations.length - paidCount

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

  return (
    <div className="min-h-screen bg-secondary/30">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold">MEF Registrations</h1>
            <p className="text-sm text-muted-foreground">
              {registrations.length} total — {paidCount} paid, {pendingCount} pending
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => fetchRegistrations(password)}>
              Refresh
            </Button>
            <Button size="sm" onClick={exportCSV}>
              <Download className="w-4 h-4 mr-1" />
              Export CSV
            </Button>
          </div>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, company, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
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
                <th className="text-left p-3 font-medium">Invite</th>
                <th className="text-left p-3 font-medium">Photos</th>
                <th className="text-left p-3 font-medium">Date</th>
                <th className="text-left p-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr key={r.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="p-3 text-muted-foreground">{i + 1}</td>
                  <td className="p-3 font-medium whitespace-nowrap">
                    {r.firstname} {r.lastname}
                  </td>
                  <td className="p-3">{r.email}</td>
                  <td className="p-3 whitespace-nowrap">{r.phone}</td>
                  <td className="p-3">{r.company}</td>
                  <td className="p-3 capitalize">{r.sector}</td>
                  <td className="p-3">{r.nation}</td>
                  <td className="p-3 whitespace-nowrap">
                    ₮{r.fee_amount?.toLocaleString()}
                    {r.fee_usd_amount && (
                      <span className="block text-xs text-muted-foreground">
                        (${r.fee_usd_amount} × {r.fee_exchange_rate?.toLocaleString()})
                      </span>
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
                    {r.is_invite ? (
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
                  <td colSpan={13} className="p-8 text-center text-muted-foreground">
                    {search ? "No matching registrations" : "No registrations yet"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

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
