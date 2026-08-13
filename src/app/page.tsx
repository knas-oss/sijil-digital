'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/hooks/use-toast'
import {
  Search, Download, Printer, Eye, Shield, LogOut, LayoutDashboard,
  FolderOpen, GraduationCap, Users, FileText, Activity, Settings,
  ChevronRight, Calendar, Clock, Award, QrCode, CheckCircle2,
  XCircle, AlertCircle, Loader2, BarChart3, FileBadge, LogIn,
  Plus, Edit2, Trash2, RefreshCw, ArrowLeft, Info
} from 'lucide-react'

// ============================================================
// Types
// ============================================================
interface SijilItem {
  id: string | null
  noSiri: string | null
  status: string
  namaKursus: string
  namaKursusBi: string | null
  kodKursus: string
  kategori: string
  kategoriKod: string
  kategoriWarna: string
  tarikhMula: string
  tarikhTamat: string
  dijanaPada: string | null
}

interface AdminUser {
  id: string
  namaPenuh: string
  emel: string
  peranan: string
}

interface StatsData {
  jumlahKursusAktif: number
  jumlahPeserta: number
  jumlahSijilDijana: number
  sijilBulanIni: number
  categoryBreakdown: { nama: string; warna: string; bil: number }[]
  monthlyStats: { bulan: string; bil: number }[]
  kursusRecent: any[]
}

// ============================================================
// Utility: Format date to BM
// ============================================================
function formatDateBM(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const months = ['Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun', 'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember']
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
}

function formatDateShort(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

// ============================================================
// Main Page Component
// ============================================================
export default function Home() {
  const [view, setView] = useState<'public' | 'admin'>('public')
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null)
  const [adminTab, setAdminTab] = useState('dashboard')

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--clay-bg)' }}>
      {/* Header */}
      <header className="clay-card-sm mx-4 mt-4 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/logo-adtec.png" alt="Logo ADTEC JTM Kampus Sandakan" className="h-10 sm:h-12 object-contain" />
          <div className="hidden sm:block">
            <h1 className="text-sm font-bold" style={{ color: 'var(--clay-ink)' }}>e-Sijil ADTEC Sandakan</h1>
            <p className="text-xs" style={{ color: 'var(--clay-ink-soft)' }}>Sistem Cetak Sijil Digital Dinamik</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {view === 'public' ? (
            <Button
              onClick={() => setView('admin')}
              className="clay-btn-secondary text-sm px-4 py-2 flex items-center gap-2"
              variant="outline"
              style={{ background: 'var(--clay)', color: 'var(--clay-primary-dark)', borderRadius: '20px', boxShadow: 'var(--clay-shadow-sm)' }}
            >
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Portal Pentadbir</span>
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              {adminUser && (
                <span className="text-xs px-3 py-1 rounded-full" style={{ background: 'var(--clay)', color: 'var(--clay-primary-dark)' }}>
                  {adminUser.namaPenuh}
                </span>
              )}
              <Button
                onClick={() => { setView('public'); setAdminUser(null) }}
                variant="outline"
                className="text-sm px-4 py-2 flex items-center gap-2"
                style={{ background: 'var(--clay)', color: 'var(--clay-ink-secondary)', borderRadius: '20px', boxShadow: 'var(--clay-shadow-sm)' }}
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Portal Awam</span>
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-6">
        {view === 'public' ? (
          <PublicPortal />
        ) : adminUser ? (
          <AdminPortal user={adminUser} activeTab={adminTab} onTabChange={setAdminTab} onLogout={() => { setAdminUser(null); setView('public') }} />
        ) : (
          <AdminLogin onLogin={(user) => { setAdminUser(user); setAdminTab('dashboard') }} />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto px-4 pb-4">
        <div className="clay-card-sm px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs" style={{ color: 'var(--clay-ink-soft)' }}>
            © 2026 ADTEC JTM Kampus Sandakan — Jabatan Tenaga Manusia, Kementerian Sumber Manusia
          </p>
          <p className="text-xs" style={{ color: 'var(--clay-ink-soft)' }}>
            e-Sijil v1.0 · SCS-ADTEC-SDK
          </p>
        </div>
      </footer>
    </div>
  )
}

// ============================================================
// PUBLIC PORTAL
// ============================================================
function PublicPortal() {
  const [mykadInput, setMykadInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<{ bilangan: number; namaDipaparkan: string; noMykadFormat: string; sijil: SijilItem[] } | null>(null)
  const [error, setError] = useState('')
  const [previewSijil, setPreviewSijil] = useState<SijilItem | null>(null)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [pdfLoading, setPdfLoading] = useState(false)
  const { toast } = useToast()

  // Format MyKad with dashes as user types
  const handleMyKadChange = (value: string) => {
    const digits = value.replace(/[^0-9]/g, '')
    if (digits.length > 12) return
    let formatted = digits
    if (digits.length > 6) formatted = `${digits.slice(0, 6)}-${digits.slice(6)}`
    if (digits.length > 8) formatted = `${digits.slice(0, 6)}-${digits.slice(6, 8)}-${digits.slice(8)}`
    setMykadInput(formatted)
  }

  const handleSearch = async () => {
    const digits = mykadInput.replace(/[^0-9]/g, '')
    if (digits.length !== 12) {
      setError('Nombor MyKad mesti mengandungi 12 digit.')
      return
    }
    setLoading(true)
    setError('')
    setResults(null)
    try {
      const res = await fetch('/api/awam/carian', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ no_mykad: digits }),
      })
      const data = await res.json()
      if (data.berjaya) {
        setResults(data)
      } else {
        setError(data.mesej || 'Tiada rekod ditemui.')
      }
    } catch {
      setError('Ralat sambungan. Sila cuba sebentar lagi.')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (sijilId: string) => {
    setPdfLoading(true)
    try {
      const res = await fetch('/api/awam/jana-sijil', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sijilId }),
      })
      if (!res.ok) throw new Error('Gagal menjana sijil')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      setPdfUrl(url)
      const a = document.createElement('a')
      a.href = url
      a.download = 'Sijil_ADTEC_Sandakan.pdf'
      a.click()
      toast({ title: 'Sijil Dimuat Turun', description: 'Fail PDF sijil telah dimuat turun.' })
    } catch {
      toast({ title: 'Ralat', description: 'Gagal menjana sijil. Sila cuba lagi.', variant: 'destructive' })
    } finally {
      setPdfLoading(false)
    }
  }

  const handlePreview = async (sijil: SijilItem) => {
    if (!sijil.id) return
    setPreviewSijil(sijil)
    setPdfLoading(true)
    try {
      const res = await fetch('/api/awam/jana-sijil', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sijilId: sijil.id }),
      })
      if (!res.ok) throw new Error('Gagal')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      setPdfUrl(url)
    } catch {
      toast({ title: 'Ralat', description: 'Gagal pratonton sijil.', variant: 'destructive' })
    } finally {
      setPdfLoading(false)
    }
  }

  const handlePrint = async (sijilId: string) => {
    setPdfLoading(true)
    try {
      const res = await fetch('/api/awam/jana-sijil', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sijilId }),
      })
      if (!res.ok) throw new Error('Gagal')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const printWindow = window.open(url, '_blank')
      if (printWindow) {
        printWindow.onload = () => { printWindow.print() }
      }
    } catch {
      toast({ title: 'Ralat', description: 'Gagal mencetak sijil.', variant: 'destructive' })
    } finally {
      setPdfLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Hero Section */}
      <div className="clay-card-lg p-8 sm:p-12 text-center hero-gradient relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ background: 'radial-gradient(circle at 30% 40%, var(--clay-primary), transparent 50%)' }} />
        <div className="relative z-10">
          <img src="/logo-adtec.png" alt="Logo ADTEC" className="h-16 sm:h-20 mx-auto mb-4 object-contain clay-float" />
          <h1 className="text-2xl sm:text-4xl font-bold mb-2" style={{ color: 'var(--clay-ink)' }}>
            e-Sijil ADTEC Sandakan
          </h1>
          <p className="text-lg sm:text-xl mb-1" style={{ color: 'var(--clay-primary-dark)' }}>
            Sistem Cetak Sijil Digital Dinamik
          </p>
          <p className="text-sm max-w-lg mx-auto" style={{ color: 'var(--clay-ink-secondary)' }}>
            Dapatkan sijil rasmi anda dalam masa kurang 1 minit — hanya dengan memasukkan nombor MyKad.
          </p>
        </div>
      </div>

      {/* Search Section */}
      <div className="clay-card p-6 sm:p-8">
        <div className="text-center mb-4">
          <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--clay-ink)' }}>
            Semak Sijil Anda
          </h2>
          <p className="text-sm" style={{ color: 'var(--clay-ink-soft)' }}>
            Masukkan nombor MyKad 12 digit untuk mencari sijil yang layak
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
          <div className="flex-1 relative">
            <input
              type="text"
              value={mykadInput}
              onChange={(e) => handleMyKadChange(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="901231-12-5678"
              className="w-full clay-input mykad-input px-6 text-center"
              style={{ background: 'var(--clay)', color: 'var(--clay-ink)', fontSize: '20px', letterSpacing: '2px' }}
              maxLength={14}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs" style={{ color: 'var(--clay-ink-soft)' }}>
              {mykadInput.replace(/[^0-9]/g, '').length}/12
            </span>
          </div>
          <button
            onClick={handleSearch}
            disabled={loading || mykadInput.replace(/[^0-9]/g, '').length !== 12}
            className="clay-btn flex items-center justify-center gap-2 px-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
            Semak
          </button>
        </div>
        {error && (
          <div className="mt-4 text-center">
            <p className="text-sm px-4 py-2 inline-block rounded-full" style={{ background: 'var(--clay-danger-bg)', color: 'var(--clay-danger)' }}>
              {error}
            </p>
          </div>
        )}
      </div>

      {/* Results */}
      {results && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <div>
              <h3 className="font-semibold" style={{ color: 'var(--clay-ink)' }}>
                {results.namaDipaparkan}
              </h3>
              <p className="text-xs" style={{ color: 'var(--clay-ink-soft)' }}>
                MyKad: {results.noMykadFormat} · {results.bilangan} sijil ditemui
              </p>
            </div>
            <Badge variant="secondary" className="clay-badge" style={{ color: 'var(--clay-success)' }}>
              <CheckCircle2 className="w-3 h-3 mr-1" /> Rekod Ditemui
            </Badge>
          </div>

          {results.sijil.map((s, idx) => (
            <div key={idx} className="clay-card p-5 relative overflow-hidden">
              {/* Category color strip */}
              <div className="absolute left-0 top-3 bottom-3 w-2 rounded-r" style={{ background: s.kategoriWarna }} />
              
              <div className="pl-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-base mb-1" style={{ color: 'var(--clay-ink)' }}>
                      {s.namaKursus}
                    </h4>
                    {s.namaKursusBi && (
                      <p className="text-sm italic mb-2" style={{ color: 'var(--clay-ink-secondary)' }}>
                        {s.namaKursusBi}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <Badge className="text-xs" style={{ background: s.kategoriWarna + '20', color: s.kategoriWarna, borderRadius: '12px' }}>
                        {s.kategori}
                      </Badge>
                      {s.status === 'sah' && (
                        <Badge className="text-xs" style={{ background: 'var(--clay-success-bg)', color: 'var(--clay-success)', borderRadius: '12px' }}>
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Sedia
                        </Badge>
                      )}
                      {s.status === 'dibatalkan' && (
                        <Badge className="text-xs" style={{ background: 'var(--clay-danger-bg)', color: 'var(--clay-danger)', borderRadius: '12px' }}>
                          <XCircle className="w-3 h-3 mr-1" /> Dibatalkan
                        </Badge>
                      )}
                      {s.status === 'menunggu' && (
                        <Badge className="text-xs" style={{ background: 'var(--clay-warning-bg)', color: 'var(--clay-warning)', borderRadius: '12px' }}>
                          <Clock className="w-3 h-3 mr-1" /> Menunggu
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs" style={{ color: 'var(--clay-ink-soft)' }}>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDateShort(s.tarikhMula)} – {formatDateShort(s.tarikhTamat)}
                      </span>
                      {s.noSiri && (
                        <span className="flex items-center gap-1">
                          <QrCode className="w-3 h-3" />
                          {s.noSiri}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {s.id && s.status === 'sah' && (
                    <div className="flex gap-2 self-start">
                      <button
                        onClick={() => handlePreview(s)}
                        className="clay-btn-secondary text-xs px-3 py-2 flex items-center gap-1"
                        style={{ background: 'var(--clay)', color: 'var(--clay-primary-dark)', borderRadius: '16px', boxShadow: 'var(--clay-shadow-sm)', fontSize: '12px' }}
                      >
                        <Eye className="w-3.5 h-3.5" /> Pratonton
                      </button>
                      <button
                        onClick={() => handleDownload(s.id!)}
                        disabled={pdfLoading}
                        className="clay-btn text-xs px-3 py-2 flex items-center gap-1"
                        style={{ borderRadius: '16px', fontSize: '12px' }}
                      >
                        {pdfLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                        Muat Turun
                      </button>
                      <button
                        onClick={() => handlePrint(s.id!)}
                        className="clay-btn-secondary text-xs px-3 py-2 flex items-center gap-1"
                        style={{ background: 'var(--clay)', color: 'var(--clay-primary-dark)', borderRadius: '16px', boxShadow: 'var(--clay-shadow-sm)', fontSize: '12px' }}
                      >
                        <Printer className="w-3.5 h-3.5" /> Cetak
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Section */}
      {!results && !loading && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: Search, title: 'Cari', desc: 'Masukkan nombor MyKad 12 digit' },
            { icon: FileBadge, title: 'Semak', desc: 'Sistem papar senarai sijil layak' },
            { icon: Download, title: 'Muat Turun', desc: 'Jana PDF sijil sedia cetak' },
          ].map((step, i) => (
            <div key={i} className="clay-card p-5 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center"
                style={{ background: 'var(--clay-primary)', color: 'white', boxShadow: 'var(--clay-shadow-sm)' }}>
                <step.icon className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-sm mb-1" style={{ color: 'var(--clay-ink)' }}>{step.title}</h3>
              <p className="text-xs" style={{ color: 'var(--clay-ink-soft)' }}>{step.desc}</p>
            </div>
          ))}
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={!!previewSijil} onOpenChange={() => { setPreviewSijil(null); if (pdfUrl) URL.revokeObjectURL(pdfUrl); setPdfUrl(null) }}>
        <DialogContent className="max-w-4xl" style={{ borderRadius: '32px', boxShadow: 'var(--clay-shadow-lg)' }}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" style={{ color: 'var(--clay-primary)' }} />
              Pratonton Sijil
            </DialogTitle>
          </DialogHeader>
          <div className="mt-2" style={{ minHeight: '400px' }}>
            {pdfLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--clay-primary)' }} />
              </div>
            ) : pdfUrl ? (
              <iframe src={pdfUrl} className="w-full border-0 rounded-2xl" style={{ height: '500px', background: 'white' }} />
            ) : null}
          </div>
          {previewSijil && previewSijil.id && (
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={() => handleDownload(previewSijil.id!)}
                className="clay-btn flex items-center gap-2 text-sm"
              >
                <Download className="w-4 h-4" /> Muat Turun PDF
              </button>
              <button
                onClick={() => handlePrint(previewSijil.id!)}
                className="clay-btn-secondary flex items-center gap-2 text-sm"
                style={{ background: 'var(--clay)', color: 'var(--clay-primary-dark)' }}
              >
                <Printer className="w-4 h-4" /> Cetak
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ============================================================
// ADMIN LOGIN
// ============================================================
function AdminLogin({ onLogin }: { onLogin: (user: AdminUser) => void }) {
  const [emel, setEmel] = useState('')
  const [kataLaluan, setKataLaluan] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { toast } = useToast()

  const handleLogin = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emel, kataLaluan }),
      })
      const data = await res.json()
      if (data.berjaya) {
        onLogin(data.pengguna)
        toast({ title: 'Log Masuk Berjaya', description: `Selamat datang, ${data.pengguna.namaPenuh}` })
      } else {
        setError(data.mesej)
      }
    } catch {
      setError('Ralat sambungan.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="clay-card-lg p-8">
        <div className="text-center mb-6">
          <img src="/logo-adtec.png" alt="ADTEC" className="h-16 mx-auto mb-4" />
          <h2 className="text-xl font-bold" style={{ color: 'var(--clay-ink)' }}>Log Masuk Pentadbir</h2>
          <p className="text-sm" style={{ color: 'var(--clay-ink-soft)' }}>Portal Pengurusan e-Sijil</p>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block" style={{ color: 'var(--clay-ink-secondary)' }}>E-mel Rasmi</label>
            <input
              type="email"
              value={emel}
              onChange={(e) => setEmel(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="admin@adtec.gov.my"
              className="w-full clay-input px-4 py-3"
              style={{ background: 'var(--clay)', color: 'var(--clay-ink)' }}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block" style={{ color: 'var(--clay-ink-secondary)' }}>Kata Laluan</label>
            <input
              type="password"
              value={kataLaluan}
              onChange={(e) => setKataLaluan(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="••••••••••••"
              className="w-full clay-input px-4 py-3"
              style={{ background: 'var(--clay)', color: 'var(--clay-ink)' }}
            />
          </div>
          {error && <p className="text-sm text-center" style={{ color: 'var(--clay-danger)' }}>{error}</p>}
          <button
            onClick={handleLogin}
            disabled={loading || !emel || !kataLaluan}
            className="clay-btn w-full flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogIn className="w-5 h-5" />}
            Log Masuk
          </button>
          <p className="text-xs text-center mt-2" style={{ color: 'var(--clay-ink-soft)' }}>
            Demo: admin@adtec.gov.my / Admin@2026
          </p>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// ADMIN PORTAL
// ============================================================
function AdminPortal({ user, activeTab, onTabChange, onLogout }: {
  user: AdminUser
  activeTab: string
  onTabChange: (tab: string) => void
  onLogout: () => void
}) {
  const tabs = [
    { id: 'dashboard', label: 'Papan Pemuka', icon: LayoutDashboard },
    { id: 'kategori', label: 'Kategori', icon: FolderOpen },
    { id: 'kursus', label: 'Kursus', icon: GraduationCap },
    { id: 'peserta', label: 'Peserta', icon: Users },
    { id: 'templat', label: 'Templat', icon: FileText },
    { id: 'sijil', label: 'Sijil', icon: Award },
    { id: 'audit', label: 'Log Audit', icon: Activity },
    { id: 'tetapan', label: 'Tetapan', icon: Settings },
  ]

  return (
    <div className="max-w-6xl mx-auto">
      {/* Admin Tabs */}
      <div className="clay-card-sm p-2 mb-6 overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap"
                style={{
                  background: isActive ? 'var(--clay-primary)' : 'transparent',
                  color: isActive ? 'white' : 'var(--clay-ink-secondary)',
                  boxShadow: isActive ? 'var(--clay-shadow-sm)' : 'none',
                }}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'dashboard' && <DashboardTab />}
      {activeTab === 'kategori' && <KategoriTab />}
      {activeTab === 'kursus' && <KursusTab />}
      {activeTab === 'peserta' && <PesertaTab />}
      {activeTab === 'templat' && <TemplatTab />}
      {activeTab === 'sijil' && <SijilTab />}
      {activeTab === 'audit' && <AuditTab />}
      {activeTab === 'tetapan' && <TetapanTab />}
    </div>
  )
}

// ============================================================
// DASHBOARD TAB
// ============================================================
function DashboardTab() {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/laporan/statistik')
      .then(r => r.json())
      .then(d => { if (d.berjaya) setStats(d.data) })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner />

  const statCards = stats ? [
    { label: 'KURSUS AKTIF', value: stats.jumlahKursusAktif, color: 'var(--clay-primary)' },
    { label: 'JUMLAH PESERTA', value: stats.jumlahPeserta, color: 'var(--clay-success)' },
    { label: 'SIJIL DIJANA', value: stats.jumlahSijilDijana, color: 'var(--clay-primary-dark)' },
    { label: 'SIJIL BULAN INI', value: stats.sijilBulanIni, color: 'var(--clay-warning)' },
  ] : []

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {statCards.map((s, i) => (
          <div key={i} className="clay-card p-5 text-center">
            <p className="text-3xl font-extrabold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs font-semibold mt-1 uppercase tracking-wider" style={{ color: 'var(--clay-ink-soft)' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Charts Area */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Monthly Chart */}
        <div className="clay-card p-5">
          <h3 className="font-semibold text-sm mb-3" style={{ color: 'var(--clay-ink)' }}>Sijil Mengikut Bulan</h3>
          <div className="flex items-end gap-1 h-40">
            {stats?.monthlyStats.map((m, i) => {
              const max = Math.max(...(stats?.monthlyStats.map(x => x.bil) || [1]), 1)
              const h = Math.max((m.bil / max) * 100, 2)
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs" style={{ color: 'var(--clay-ink-soft)' }}>{m.bil || ''}</span>
                  <div className="w-full rounded-t-lg transition-all" style={{ height: `${h}%`, background: 'var(--clay-primary)', minHeight: '4px', opacity: 0.7 + (i / 12) * 0.3 }} />
                  <span className="text-[9px] -rotate-45 origin-top-left" style={{ color: 'var(--clay-ink-soft)' }}>{m.bulan}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="clay-card p-5">
          <h3 className="font-semibold text-sm mb-3" style={{ color: 'var(--clay-ink)' }}>Sijil Mengikut Kategori</h3>
          <div className="space-y-3">
            {stats?.categoryBreakdown.map((c, i) => {
              const max = Math.max(...(stats?.categoryBreakdown.map(x => x.bil) || [1]), 1)
              return (
                <div key={i}>
                  <div className="flex justify-between text-xs mb-1">
                    <span style={{ color: 'var(--clay-ink-secondary)' }}>{c.nama}</span>
                    <span className="font-semibold" style={{ color: c.warna }}>{c.bil}</span>
                  </div>
                  <div className="h-2 rounded-full" style={{ background: 'var(--clay)' }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${(c.bil / max) * 100}%`, background: c.warna }} />
                  </div>
                </div>
              )
            })}
            {(!stats?.categoryBreakdown.length) && (
              <p className="text-sm text-center py-4" style={{ color: 'var(--clay-ink-soft)' }}>Tiada data lagi</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Courses */}
      <div className="clay-card p-5">
        <h3 className="font-semibold text-sm mb-3" style={{ color: 'var(--clay-ink)' }}>Kursus Terkini</h3>
        <div className="space-y-2">
          {stats?.kursusRecent.map((k: any) => (
            <div key={k.id} className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'rgba(124,108,240,0.04)' }}>
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--clay-ink)' }}>{k.namaKursusBm}</p>
                <p className="text-xs" style={{ color: 'var(--clay-ink-soft)' }}>{k.kodKursus} · {k.kategori?.namaKategori}</p>
              </div>
              <div className="flex gap-3 text-xs" style={{ color: 'var(--clay-ink-soft)' }}>
                <span>{k._count?.peserta || 0} peserta</span>
                <span>{k._count?.sijil || 0} sijil</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ============================================================
// KATEGORI TAB
// ============================================================
function KategoriTab() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/kategori').then(r => r.json()).then(d => { if (d.berjaya) setData(d.data) }).finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner />

  return (
    <div className="clay-card p-5">
      <h3 className="font-semibold mb-4" style={{ color: 'var(--clay-ink)' }}>Pengurusan Kategori Program</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: 'var(--clay-primary)', color: 'white' }}>
              <th className="px-4 py-3 text-left rounded-tl-xl">Kod</th>
              <th className="px-4 py-3 text-left">Nama Kategori</th>
              <th className="px-4 py-3 text-left">Keterangan</th>
              <th className="px-4 py-3 text-center">Kursus</th>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="px-4 py-3 text-center rounded-tr-xl">Warna</th>
            </tr>
          </thead>
          <tbody>
            {data.map((k, i) => (
              <tr key={k.id} className={i % 2 === 0 ? '' : ''} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(124,108,240,0.04)' }}>
                <td className="px-4 py-3 font-mono font-semibold" style={{ color: 'var(--clay-primary)' }}>{k.kodKategori}</td>
                <td className="px-4 py-3" style={{ color: 'var(--clay-ink)' }}>{k.namaKategori}</td>
                <td className="px-4 py-3 text-xs" style={{ color: 'var(--clay-ink-secondary)' }}>{k.keterangan || '-'}</td>
                <td className="px-4 py-3 text-center" style={{ color: 'var(--clay-ink-secondary)' }}>{k._count?.kursus || 0}</td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold"
                    style={{ background: k.status === 'aktif' ? 'var(--clay-success-bg)' : 'var(--clay-warning-bg)', color: k.status === 'aktif' ? 'var(--clay-success)' : 'var(--clay-warning)' }}>
                    {k.status === 'aktif' ? 'Aktif' : 'Arkib'}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-block w-5 h-5 rounded-full" style={{ background: k.warnaLabel }} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ============================================================
// KURSUS TAB
// ============================================================
function KursusTab() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/kursus').then(r => r.json()).then(d => { if (d.berjaya) setData(d.data) }).finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner />

  return (
    <div className="clay-card p-5">
      <h3 className="font-semibold mb-4" style={{ color: 'var(--clay-ink)' }}>Pengurusan Kursus / Program</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: 'var(--clay-primary)', color: 'white' }}>
              <th className="px-3 py-3 text-left rounded-tl-xl">Kod</th>
              <th className="px-3 py-3 text-left">Nama Kursus</th>
              <th className="px-3 py-3 text-left">Kategori</th>
              <th className="px-3 py-3 text-center">Peserta</th>
              <th className="px-3 py-3 text-center">Sijil</th>
              <th className="px-3 py-3 text-center">Status</th>
              <th className="px-3 py-3 text-center rounded-tr-xl">Tarikh</th>
            </tr>
          </thead>
          <tbody>
            {data.map((k, i) => (
              <tr key={k.id} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(124,108,240,0.04)' }}>
                <td className="px-3 py-3 font-mono text-xs" style={{ color: 'var(--clay-primary)' }}>{k.kodKursus}</td>
                <td className="px-3 py-3" style={{ color: 'var(--clay-ink)' }}>
                  <p className="font-medium">{k.namaKursusBm}</p>
                  {k.namaKursusBi && <p className="text-xs italic" style={{ color: 'var(--clay-ink-soft)' }}>{k.namaKursusBi}</p>}
                </td>
                <td className="px-3 py-3">
                  <span className="inline-block px-2 py-0.5 rounded-full text-xs" style={{ background: (k.kategori?.warnaLabel || '#7C6CF0') + '20', color: k.kategori?.warnaLabel || '#7C6CF0' }}>
                    {k.kategori?.namaKategori || '-'}
                  </span>
                </td>
                <td className="px-3 py-3 text-center" style={{ color: 'var(--clay-ink-secondary)' }}>{k._count?.peserta || 0}</td>
                <td className="px-3 py-3 text-center" style={{ color: 'var(--clay-ink-secondary)' }}>{k._count?.sijil || 0}</td>
                <td className="px-3 py-3 text-center">
                  <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold"
                    style={{
                      background: k.status === 'aktif' ? 'var(--clay-success-bg)' : k.status === 'tamat' ? 'var(--clay-warning-bg)' : 'rgba(124,108,240,0.08)',
                      color: k.status === 'aktif' ? 'var(--clay-success)' : k.status === 'tamat' ? 'var(--clay-warning)' : 'var(--clay-primary)'
                    }}>
                    {k.status === 'aktif' ? 'Aktif' : k.status === 'tamat' ? 'Tamat' : k.status === 'draf' ? 'Draf' : 'Arkib'}
                  </span>
                </td>
                <td className="px-3 py-3 text-xs" style={{ color: 'var(--clay-ink-soft)' }}>
                  {formatDateShort(k.tarikhMula)}<br />– {formatDateShort(k.tarikhTamat)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ============================================================
// PESERTA TAB
// ============================================================
function PesertaTab() {
  const [kursusList, setKursusList] = useState<any[]>([])
  const [selectedKursus, setSelectedKursus] = useState<string>('')
  const [pesertaList, setPesertaList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Load kursus list and first set of peserta on mount
  useEffect(() => {
    fetch('/api/kursus').then(r => r.json()).then(d => {
      if (d.berjaya) {
        setKursusList(d.data)
        if (d.data.length > 0) {
          const firstId = d.data[0].id
          setSelectedKursus(firstId)
          fetch(`/api/peserta?kursusId=${firstId}`).then(r2 => r2.json()).then(d2 => {
            if (d2.berjaya) setPesertaList(d2.data)
          }).finally(() => setLoading(false))
        }
      }
    })
  }, [])

  const handleKursusChange = (id: string) => {
    setSelectedKursus(id)
    setLoading(true)
    fetch(`/api/peserta?kursusId=${id}`).then(r => r.json()).then(d => {
      if (d.berjaya) setPesertaList(d.data)
    }).finally(() => setLoading(false))
  }

  return (
    <div className="space-y-4">
      {/* Kursus selector */}
      <div className="clay-card p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <h3 className="font-semibold" style={{ color: 'var(--clay-ink)' }}>Senarai Peserta</h3>
          <select
            value={selectedKursus}
            onChange={(e) => handleKursusChange(e.target.value)}
            className="clay-input px-4 py-2 text-sm flex-1 sm:max-w-md"
            style={{ background: 'var(--clay)', color: 'var(--clay-ink)' }}
          >
            {kursusList.map((k: any) => (
              <option key={k.id} value={k.id}>{k.namaKursusBm} ({k.kodKursus})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Participant table */}
      {loading ? <LoadingSpinner /> : (
        <div className="clay-card p-5">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'var(--clay-primary)', color: 'white' }}>
                  <th className="px-3 py-3 text-left rounded-tl-xl">#</th>
                  <th className="px-3 py-3 text-left">Nama Penuh</th>
                  <th className="px-3 py-3 text-left">No. MyKad</th>
                  <th className="px-3 py-3 text-center">Jantina</th>
                  <th className="px-3 py-3 text-center">Kelayakan</th>
                  <th className="px-3 py-3 text-center rounded-tr-xl">Sijil</th>
                </tr>
              </thead>
              <tbody>
                {pesertaList.map((p: any, i: number) => (
                  <tr key={p.id} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(124,108,240,0.04)' }}>
                    <td className="px-3 py-3 text-center" style={{ color: 'var(--clay-ink-soft)' }}>{i + 1}</td>
                    <td className="px-3 py-3 font-medium" style={{ color: 'var(--clay-ink)' }}>{p.namaPenuh}</td>
                    <td className="px-3 py-3 font-mono text-xs" style={{ color: 'var(--clay-ink-secondary)' }}>
                      {p.noMykad.length === 12 ? `${p.noMykad.slice(0,6)}-${p.noMykad.slice(6,8)}-${p.noMykad.slice(8)}` : p.noMykad}
                    </td>
                    <td className="px-3 py-3 text-center text-xs" style={{ color: 'var(--clay-ink-secondary)' }}>{p.jantina === 'lelaki' ? '♂' : '♀'}</td>
                    <td className="px-3 py-3 text-center">
                      <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold"
                        style={{
                          background: p.statusKelayakan === 'layak' ? 'var(--clay-success-bg)' : p.statusKelayakan === 'tidak_layak' ? 'var(--clay-danger-bg)' : 'var(--clay-warning-bg)',
                          color: p.statusKelayakan === 'layak' ? 'var(--clay-success)' : p.statusKelayakan === 'tidak_layak' ? 'var(--clay-danger)' : 'var(--clay-warning)'
                        }}>
                        {p.statusKelayakan === 'layak' ? 'Layak' : p.statusKelayakan === 'tidak_layak' ? 'Tidak Layak' : 'Ditangguh'}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-center" style={{ color: 'var(--clay-ink-soft)' }}>
                      {p.sijil?.length > 0 ? <CheckCircle2 className="w-4 h-4 inline" style={{ color: 'var(--clay-success)' }} /> : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================================
// TEMPLAT TAB
// ============================================================
function TemplatTab() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/templat').then(r => r.json()).then(d => { if (d.berjaya) setData(d.data) }).finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold" style={{ color: 'var(--clay-ink)' }}>Galeri Templat Sijil</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map((t: any) => (
          <div key={t.id} className="clay-card p-5">
            {/* Template preview area */}
            <div className="rounded-xl mb-4 flex items-center justify-center"
              style={{
                background: t.orientasi === 'landskap' ? 'linear-gradient(135deg, #f8f9ff, #eef0fa)' : 'linear-gradient(180deg, #f8f9ff, #eef0fa)',
                aspectRatio: t.orientasi === 'landskap' ? '297/210' : '210/297',
                border: '2px dashed var(--border)',
              }}>
              <div className="text-center">
                <FileText className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--clay-primary)', opacity: 0.5 }} />
                <p className="text-xs" style={{ color: 'var(--clay-ink-soft)' }}>
                  {t.orientasi === 'landskap' ? 'Landskap' : 'Potret'} · {t.saizKertas?.toUpperCase()}
                </p>
              </div>
            </div>
            <h4 className="font-semibold text-sm mb-1" style={{ color: 'var(--clay-ink)' }}>{t.namaTemplat}</h4>
            <p className="text-xs mb-2" style={{ color: 'var(--clay-ink-soft)' }}>{t.keterangan || 'Tiada keterangan'}</p>
            <div className="flex items-center justify-between">
              <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold"
                style={{
                  background: t.status === 'aktif' ? 'var(--clay-success-bg)' : t.status === 'draf' ? 'var(--clay-warning-bg)' : 'rgba(124,108,240,0.08)',
                  color: t.status === 'aktif' ? 'var(--clay-success)' : t.status === 'draf' ? 'var(--clay-warning)' : 'var(--clay-primary)'
                }}>
                {t.status === 'aktif' ? 'Aktif' : t.status === 'draf' ? 'Draf' : 'Arkib'}
              </span>
              <span className="text-xs" style={{ color: 'var(--clay-ink-soft)' }}>v{t.versi} · {t.medanTemplat?.length || 0} medan</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================================
// SIJIL TAB
// ============================================================
function SijilTab() {
  const [kursusList, setKursusList] = useState<any[]>([])
  const [selectedKursus, setSelectedKursus] = useState<string>('')
  const [sijilList, setSijilList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetch('/api/kursus').then(r => r.json()).then(d => {
      if (d.berjaya) {
        setKursusList(d.data)
        if (d.data.length > 0) {
          const firstId = d.data[0].id
          setSelectedKursus(firstId)
          fetch(`/api/sijil?kursusId=${firstId}`).then(r2 => r2.json()).then(d2 => {
            if (d2.berjaya) setSijilList(d2.data)
          }).finally(() => setLoading(false))
        }
      }
    })
  }, [])

  const handleKursusChange = (id: string) => {
    setSelectedKursus(id)
    setLoading(true)
    fetch(`/api/sijil?kursusId=${id}`).then(r => r.json()).then(d => {
      if (d.berjaya) setSijilList(d.data)
    }).finally(() => setLoading(false))
  }

  const handleBulkGenerate = async () => {
    setGenerating(true)
    try {
      const res = await fetch('/api/sijil', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kursusId: selectedKursus, dimuatNaikOlehId: 'admin' }),
      })
      const data = await res.json()
      if (data.berjaya) {
        toast({ title: 'Sijil Dijana', description: `${data.bilDijana} sijil berjaya dijana.` })
        // Refresh
        fetch(`/api/sijil?kursusId=${selectedKursus}`).then(r => r.json()).then(d => {
          if (d.berjaya) setSijilList(d.data)
        })
      }
    } catch {
      toast({ title: 'Ralat', description: 'Galah menjana sijil.', variant: 'destructive' })
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="clay-card p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <h3 className="font-semibold" style={{ color: 'var(--clay-ink)' }}>Senarai Sijil</h3>
          <select value={selectedKursus} onChange={(e) => handleKursusChange(e.target.value)}
            className="clay-input px-4 py-2 text-sm flex-1 sm:max-w-sm"
            style={{ background: 'var(--clay)', color: 'var(--clay-ink)' }}>
            {kursusList.map((k: any) => <option key={k.id} value={k.id}>{k.namaKursusBm}</option>)}
          </select>
          <button onClick={handleBulkGenerate} disabled={generating}
            className="clay-btn text-sm flex items-center gap-2"
            style={{ borderRadius: '16px' }}>
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Jana Semua Sijil
          </button>
        </div>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="clay-card p-5">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'var(--clay-primary)', color: 'white' }}>
                  <th className="px-3 py-3 text-left rounded-tl-xl">No. Siri</th>
                  <th className="px-3 py-3 text-left">Nama Peserta</th>
                  <th className="px-3 py-3 text-left">No. MyKad</th>
                  <th className="px-3 py-3 text-center">Status</th>
                  <th className="px-3 py-3 text-center rounded-tr-xl">Muat Turun</th>
                </tr>
              </thead>
              <tbody>
                {sijilList.map((s: any, i: number) => (
                  <tr key={s.id} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(124,108,240,0.04)' }}>
                    <td className="px-3 py-3 font-mono text-xs" style={{ color: 'var(--clay-primary)' }}>{s.noSiri}</td>
                    <td className="px-3 py-3" style={{ color: 'var(--clay-ink)' }}>{s.peserta?.namaPenuh}</td>
                    <td className="px-3 py-3 font-mono text-xs" style={{ color: 'var(--clay-ink-secondary)' }}>
                      {s.peserta?.noMykad ? `${s.peserta.noMykad.slice(0,6)}-${s.peserta.noMykad.slice(6,8)}-${s.peserta.noMykad.slice(8)}` : '-'}
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold"
                        style={{ background: s.status === 'sah' ? 'var(--clay-success-bg)' : 'var(--clay-danger-bg)', color: s.status === 'sah' ? 'var(--clay-success)' : 'var(--clay-danger)' }}>
                        {s.status === 'sah' ? 'Sah' : 'Dibatalkan'}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-center" style={{ color: 'var(--clay-ink-soft)' }}>{s.bilMuatTurun}</td>
                  </tr>
                ))}
                {sijilList.length === 0 && (
                  <tr><td colSpan={5} className="px-3 py-8 text-center" style={{ color: 'var(--clay-ink-soft)' }}>
                    Tiada sijil lagi. Klik &quot;Jana Semua Sijil&quot; untuk menjana sijil bagi peserta yang layak.
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================================
// AUDIT TAB
// ============================================================
function AuditTab() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/log-audit').then(r => r.json()).then(d => { if (d.berjaya) setData(d.data) }).finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner />

  return (
    <div className="clay-card p-5">
      <h3 className="font-semibold mb-4" style={{ color: 'var(--clay-ink)' }}>Log Audit</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: 'var(--clay-primary)', color: 'white' }}>
              <th className="px-3 py-3 text-left rounded-tl-xl">Masa</th>
              <th className="px-3 py-3 text-left">Pengguna</th>
              <th className="px-3 py-3 text-left">Tindakan</th>
              <th className="px-3 py-3 text-left">Entiti</th>
              <th className="px-3 py-3 text-left rounded-tr-xl">IP</th>
            </tr>
          </thead>
          <tbody>
            {data.map((l: any, i: number) => (
              <tr key={l.id} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(124,108,240,0.04)' }}>
                <td className="px-3 py-3 text-xs" style={{ color: 'var(--clay-ink-secondary)' }}>{new Date(l.diciptaPada).toLocaleString('ms-MY')}</td>
                <td className="px-3 py-3 text-xs" style={{ color: 'var(--clay-ink)' }}>{l.pengguna?.namaPenuh || 'Awam'}</td>
                <td className="px-3 py-3 text-xs font-mono" style={{ color: 'var(--clay-primary)' }}>{l.tindakan}</td>
                <td className="px-3 py-3 text-xs" style={{ color: 'var(--clay-ink-secondary)' }}>{l.entiti}</td>
                <td className="px-3 py-3 text-xs font-mono" style={{ color: 'var(--clay-ink-soft)' }}>{l.alamatIp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ============================================================
// TETAPAN TAB
// ============================================================
function TetapanTab() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetch('/api/tetapan').then(r => r.json()).then(d => { if (d.berjaya) setData(d.data) }).finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/tetapan', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) toast({ title: 'Tetapan Disimpan' })
      else toast({ title: 'Ralat', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="clay-card p-6 max-w-2xl">
      <h3 className="font-semibold mb-4" style={{ color: 'var(--clay-ink)' }}>Tetapan Sistem</h3>
      {data && (
        <div className="space-y-4">
          <FormField label="Nama Institusi" value={data.namaInstitusi} onChange={(v) => setData({ ...data, namaInstitusi: v })} />
          <FormField label="Alamat" value={data.alamatInstitusi || ''} onChange={(v) => setData({ ...data, alamatInstitusi: v })} />
          <FormField label="E-mel Hubungan" value={data.emelHubungan || ''} onChange={(v) => setData({ ...data, emelHubungan: v })} />
          <FormField label="Telefon" value={data.telefonHubungan || ''} onChange={(v) => setData({ ...data, telefonHubungan: v })} />
          <FormField label="Nama Pengarah" value={data.namaPengarah || ''} onChange={(v) => setData({ ...data, namaPengarah: v })} />
          <FormField label="Teks Pengaki Sijil" value={data.teksPengaki || ''} onChange={(v) => setData({ ...data, teksPengaki: v })} multiline />
          
          <div className="space-y-2 pt-2">
            <h4 className="text-sm font-medium" style={{ color: 'var(--clay-ink-secondary)' }}>Ciri Sistem</h4>
            <ToggleField label="Pengesahan Kedua (4 digit MyKad)" checked={data.pengesahanKedua} onChange={(v) => setData({ ...data, pengesahanKedua: v })} />
            <ToggleField label="CAPTCHA" checked={data.captchaAktif} onChange={(v) => setData({ ...data, captchaAktif: v })} />
            <ToggleField label="Mod Penyelenggaraan" checked={data.modPenyelenggaraan} onChange={(v) => setData({ ...data, modPenyelenggaraan: v })} />
          </div>

          <button onClick={handleSave} disabled={saving} className="clay-btn w-full flex items-center justify-center gap-2 mt-4">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Settings className="w-4 h-4" />}
            Simpan Tetapan
          </button>
        </div>
      )}
    </div>
  )
}

// ============================================================
// Helper Components
// ============================================================
function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--clay-primary)' }} />
    </div>
  )
}

function FormField({ label, value, onChange, multiline }: { label: string; value: string; onChange: (v: string) => void; multiline?: boolean }) {
  return (
    <div>
      <label className="text-sm font-medium mb-1 block" style={{ color: 'var(--clay-ink-secondary)' }}>{label}</label>
      {multiline ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3}
          className="w-full clay-input px-4 py-3 text-sm" style={{ background: 'var(--clay)', color: 'var(--clay-ink)' }} />
      ) : (
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)}
          className="w-full clay-input px-4 py-3 text-sm" style={{ background: 'var(--clay)', color: 'var(--clay-ink)' }} />
      )}
    </div>
  )
}

function ToggleField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm" style={{ color: 'var(--clay-ink-secondary)' }}>{label}</span>
      <button
        onClick={() => onChange(!checked)}
        className="relative w-12 h-6 rounded-full transition-colors"
        style={{ background: checked ? 'var(--clay-primary)' : 'var(--clay-ink-soft)', boxShadow: 'var(--clay-shadow-sm)' }}
      >
        <span className="absolute top-1 w-4 h-4 rounded-full bg-white transition-transform"
          style={{ left: checked ? '26px' : '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
      </button>
    </div>
  )
}
