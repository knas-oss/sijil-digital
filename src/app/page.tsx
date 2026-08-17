'use client'

import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import {
  Search, Download, Printer, Eye, Shield, LogOut, LayoutDashboard,
  FolderOpen, GraduationCap, Users, FileText, Activity, Settings,
  ChevronRight, Calendar, Clock, Award, QrCode, CheckCircle2,
  XCircle, AlertCircle, Loader2, BarChart3, FileBadge, LogIn,
  Plus, Edit2, Trash2, RefreshCw, ArrowLeft, Info, Save,
  GripVertical, Type, AlignLeft, AlignCenter, AlignRight,
  Bold, Italic, Move, X, ZoomIn, ZoomOut,
  Share2, Copy, Check, ExternalLink, UserPlus, Mail, Phone,
  Upload, Image as ImageIcon, PenLine
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
// Main Page Component (wraps HomeContent in Suspense for useSearchParams)
// ============================================================
export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--clay-bg)' }}><Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--clay-primary)' }} /></div>}>
      <HomeContent />
    </Suspense>
  )
}

function HomeContent() {
  const searchParams = useSearchParams()
  const daftarKursusId = searchParams.get('daftar')
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
          <PublicPortal daftarKursusId={daftarKursusId} />
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
function PublicPortal({ daftarKursusId }: { daftarKursusId: string | null }) {
  const [mykadInput, setMykadInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<{ bilangan: number; namaDipaparkan: string; noMykadFormat: string; sijil: SijilItem[] } | null>(null)
  const [error, setError] = useState('')
  const [previewSijil, setPreviewSijil] = useState<SijilItem | null>(null)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [pdfLoading, setPdfLoading] = useState(false)
  const { toast } = useToast()

  // Registration form state
  const [daftarMode, setDaftarMode] = useState(false)
  const [daftarKursus, setDaftarKursus] = useState<any>(null)
  const [daftarLoading, setDaftarLoading] = useState(false)
  const [daftarSuccess, setDaftarSuccess] = useState(false)
  const [daftarNama, setDaftarNama] = useState('')
  const [daftarMykad, setDaftarMykad] = useState('')
  const [daftarTelefon, setDaftarTelefon] = useState('')
  const [daftarEmel, setDaftarEmel] = useState('')
  const [daftarJantina, setDaftarJantina] = useState('')
  const [daftarError, setDaftarError] = useState('')

  useEffect(() => {
    if (daftarKursusId) {
      setDaftarMode(true)
      setDaftarLoading(true)
      fetch(`/api/awam/pendaftaran?kursusId=${daftarKursusId}`)
        .then(r => r.json())
        .then(d => {
          if (d.berjaya) setDaftarKursus(d.data)
          else setDaftarError(d.mesej || 'Kursus tidak dijumpai.')
        })
        .catch(() => setDaftarError('Ralat sambungan.'))
        .finally(() => setDaftarLoading(false))
    }
  }, [daftarKursusId])

  const handleDaftarMyKadChange = (value: string) => {
    const digits = value.replace(/[^0-9]/g, '')
    if (digits.length > 12) return
    let formatted = digits
    if (digits.length > 6) formatted = `${digits.slice(0, 6)}-${digits.slice(6)}`
    if (digits.length > 8) formatted = `${digits.slice(0, 6)}-${digits.slice(6, 8)}-${digits.slice(8)}`
    setDaftarMykad(formatted)
  }

  const handleDaftar = async () => {
    const digits = daftarMykad.replace(/[^0-9]/g, '')
    if (!daftarNama.trim() || digits.length !== 12) {
      setDaftarError('Nama penuh dan nombor MyKad 12 digit wajib diisi.')
      return
    }
    setDaftarLoading(true)
    setDaftarError('')
    try {
      const res = await fetch('/api/awam/pendaftaran', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kursusId: daftarKursusId,
          namaPenuh: daftarNama,
          noMykad: digits,
          noTelefon: daftarTelefon,
          emel: daftarEmel,
          jantina: daftarJantina,
        }),
      })
      const data = await res.json()
      if (data.berjaya) {
        setDaftarSuccess(true)
      } else {
        setDaftarError(data.mesej || 'Gagal mendaftar.')
      }
    } catch {
      setDaftarError('Ralat sambungan. Sila cuba sebentar lagi.')
    } finally {
      setDaftarLoading(false)
    }
  }

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
      {/* ====== REGISTRATION MODE ====== */}
      {daftarMode && (
        <div className="space-y-6">
          {/* Hero */}
          <div className="clay-card-lg p-8 sm:p-12 text-center hero-gradient relative overflow-hidden">
            <div className="absolute inset-0 opacity-5" style={{ background: 'radial-gradient(circle at 30% 40%, var(--clay-primary), transparent 50%)' }} />
            <div className="relative z-10">
              <img src="/logo-adtec.png" alt="Logo ADTEC" className="h-16 sm:h-20 mx-auto mb-4 object-contain clay-float" />
              <h1 className="text-2xl sm:text-4xl font-bold mb-2" style={{ color: 'var(--clay-ink)' }}>
                Pendaftaran Kursus
              </h1>
              <p className="text-lg sm:text-xl mb-1" style={{ color: 'var(--clay-primary-dark)' }}>
                e-Sijil ADTEC Sandakan
              </p>
              <p className="text-sm max-w-lg mx-auto" style={{ color: 'var(--clay-ink-secondary)' }}>
                Isikan maklumat anda untuk mendaftar kursus. Pendaftaran memerlukan kelulusan pentadbir.
              </p>
            </div>
          </div>

          {daftarLoading && !daftarKursus && !daftarError && (
            <div className="clay-card p-8 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3" style={{ color: 'var(--clay-primary)' }} />
              <p className="text-sm" style={{ color: 'var(--clay-ink-soft)' }}>Memuat maklumat kursus...</p>
            </div>
          )}

          {daftarError && !daftarKursus && (
            <div className="clay-card p-8 text-center">
              <AlertCircle className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--clay-danger)' }} />
              <h3 className="font-semibold text-lg mb-2" style={{ color: 'var(--clay-ink)' }}>Ralat</h3>
              <p className="text-sm mb-4" style={{ color: 'var(--clay-danger)' }}>{daftarError}</p>
              <button onClick={() => { window.location.href = '/' }} className="clay-btn-secondary text-sm px-5 py-2" style={{ background: 'var(--clay)', color: 'var(--clay-primary-dark)', borderRadius: '16px', boxShadow: 'var(--clay-shadow-sm)' }}>
                <ArrowLeft className="w-4 h-4 inline mr-1" /> Kembali ke e-Sijil
              </button>
            </div>
          )}

          {daftarSuccess && (
            <div className="clay-card p-8 text-center">
              <CheckCircle2 className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--clay-success)' }} />
              <h3 className="font-bold text-xl mb-2" style={{ color: 'var(--clay-ink)' }}>Pendaftaran Berjaya Dihantar!</h3>
              <p className="text-sm mb-4 max-w-md mx-auto" style={{ color: 'var(--clay-ink-secondary)' }}>
                Permohonan pendaftaran anda telah dihantar. Sila tunggu kelulusan pentadbir sebelum anda dimasukkan sebagai peserta rasmi.
              </p>
              <div className="clay-card-sm p-4 max-w-sm mx-auto mb-4" style={{ background: 'rgba(79,196,161,0.08)' }}>
                <p className="text-xs" style={{ color: 'var(--clay-success)' }}>
                  <Info className="w-3.5 h-3.5 inline mr-1" />
                  Anda akan dimaklumkan melalui e-mel atau telefon setelah pendaftaran diluluskan.
                </p>
              </div>
              <button onClick={() => { window.location.href = '/' }} className="clay-btn text-sm px-5 py-2 flex items-center gap-2 mx-auto">
                <ArrowLeft className="w-4 h-4" /> Kembali ke e-Sijil
              </button>
            </div>
          )}

          {daftarKursus && !daftarSuccess && (
            <>
              {/* Kursus Info Card */}
              <div className="clay-card p-6">
                <h3 className="font-semibold text-base mb-3 flex items-center gap-2" style={{ color: 'var(--clay-ink)' }}>
                  <GraduationCap className="w-5 h-5" style={{ color: 'var(--clay-primary)' }} />
                  Maklumat Kursus
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="clay-card-sm p-3">
                    <p className="text-xs" style={{ color: 'var(--clay-ink-soft)' }}>Nama Kursus</p>
                    <p className="font-semibold text-sm" style={{ color: 'var(--clay-ink)' }}>{daftarKursus.namaKursusBm}</p>
                  </div>
                  <div className="clay-card-sm p-3">
                    <p className="text-xs" style={{ color: 'var(--clay-ink-soft)' }}>Kod Kursus</p>
                    <p className="font-mono text-sm" style={{ color: 'var(--clay-primary)' }}>{daftarKursus.kodKursus}</p>
                  </div>
                  <div className="clay-card-sm p-3">
                    <p className="text-xs" style={{ color: 'var(--clay-ink-soft)' }}>Kategori</p>
                    <p className="text-sm" style={{ color: 'var(--clay-ink)' }}>{daftarKursus.kategori}</p>
                  </div>
                  <div className="clay-card-sm p-3">
                    <p className="text-xs" style={{ color: 'var(--clay-ink-soft)' }}>Tarikh</p>
                    <p className="text-sm" style={{ color: 'var(--clay-ink)' }}>{formatDateShort(daftarKursus.tarikhMula)} – {formatDateShort(daftarKursus.tarikhTamat)}</p>
                  </div>
                  {daftarKursus.tempat && (
                    <div className="clay-card-sm p-3">
                      <p className="text-xs" style={{ color: 'var(--clay-ink-soft)' }}>Tempat</p>
                      <p className="text-sm" style={{ color: 'var(--clay-ink)' }}>{daftarKursus.tempat}</p>
                    </div>
                  )}
                  {daftarKursus.penyelaras && (
                    <div className="clay-card-sm p-3">
                      <p className="text-xs" style={{ color: 'var(--clay-ink-soft)' }}>Penyelaras</p>
                      <p className="text-sm" style={{ color: 'var(--clay-ink)' }}>{daftarKursus.penyelaras}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Registration Form Card */}
              <div className="clay-card p-6 sm:p-8">
                <h3 className="font-semibold text-base mb-4 flex items-center gap-2" style={{ color: 'var(--clay-ink)' }}>
                  <UserPlus className="w-5 h-5" style={{ color: 'var(--clay-primary)' }} />
                  Borang Pendaftaran
                </h3>
                <div className="space-y-4">
                  {/* Nama Penuh */}
                  <div>
                    <label className="text-sm font-semibold mb-1 block" style={{ color: 'var(--clay-ink-secondary)' }}>
                      Nama Penuh <span style={{ color: 'var(--clay-destructive)' }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={daftarNama}
                      onChange={e => setDaftarNama(e.target.value)}
                      placeholder="NAMA PENUH SEPERTI DI MYKAD"
                      className="w-full clay-input px-4 py-3 uppercase"
                      style={{ background: 'var(--clay)', color: 'var(--clay-ink)' }}
                    />
                  </div>
                  {/* No. MyKad */}
                  <div>
                    <label className="text-sm font-semibold mb-1 block" style={{ color: 'var(--clay-ink-secondary)' }}>
                      No. MyKad <span style={{ color: 'var(--clay-destructive)' }}>*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={daftarMykad}
                        onChange={e => handleDaftarMyKadChange(e.target.value)}
                        placeholder="901231-12-5678"
                        className="w-full clay-input px-6 py-3 text-center"
                        style={{ background: 'var(--clay)', color: 'var(--clay-ink)', fontSize: '18px', letterSpacing: '2px' }}
                        maxLength={14}
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs" style={{ color: 'var(--clay-ink-soft)' }}>
                        {daftarMykad.replace(/[^0-9]/g, '').length}/12
                      </span>
                    </div>
                  </div>
                  {/* No. Telefon & Emel */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-semibold mb-1 block" style={{ color: 'var(--clay-ink-secondary)' }}>No. Telefon</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--clay-ink-soft)' }} />
                        <input
                          type="tel"
                          value={daftarTelefon}
                          onChange={e => setDaftarTelefon(e.target.value)}
                          placeholder="012-3456789"
                          className="w-full clay-input pl-10 pr-4 py-3"
                          style={{ background: 'var(--clay)', color: 'var(--clay-ink)' }}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-semibold mb-1 block" style={{ color: 'var(--clay-ink-secondary)' }}>E-mel</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--clay-ink-soft)' }} />
                        <input
                          type="email"
                          value={daftarEmel}
                          onChange={e => setDaftarEmel(e.target.value)}
                          placeholder="contoh@emel.com"
                          className="w-full clay-input pl-10 pr-4 py-3"
                          style={{ background: 'var(--clay)', color: 'var(--clay-ink)' }}
                        />
                      </div>
                    </div>
                  </div>
                  {/* Jantina */}
                  <div>
                    <label className="text-sm font-semibold mb-1 block" style={{ color: 'var(--clay-ink-secondary)' }}>Jantina</label>
                    <Select value={daftarJantina} onValueChange={setDaftarJantina}>
                      <SelectTrigger className="h-11" style={{ borderRadius: '16px', boxShadow: 'var(--clay-inset)', background: 'var(--clay)', border: '2px solid transparent' }}>
                        <SelectValue placeholder="Pilih jantina" />
                      </SelectTrigger>
                      <SelectContent style={{ borderRadius: '16px' }}>
                        <SelectItem value="lelaki">Lelaki</SelectItem>
                        <SelectItem value="perempuan">Perempuan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {daftarError && (
                    <div className="rounded-xl p-3 text-sm" style={{ background: 'var(--clay-danger-bg)', color: 'var(--clay-danger)', borderRadius: '12px' }}>
                      {daftarError}
                    </div>
                  )}

                  <button
                    onClick={handleDaftar}
                    disabled={daftarLoading || !daftarNama.trim() || daftarMykad.replace(/[^0-9]/g, '').length !== 12}
                    className="clay-btn w-full flex items-center justify-center gap-2 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {daftarLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserPlus className="w-5 h-5" />}
                    {daftarLoading ? 'Menghantar...' : 'Hantar Pendaftaran'}
                  </button>

                  <div className="flex items-start gap-2 p-3 rounded-xl" style={{ background: 'rgba(79,196,161,0.08)' }}>
                    <Info className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--clay-success)' }} />
                    <p className="text-xs" style={{ color: 'var(--clay-ink-secondary)' }}>
                      Pendaftaran anda perlu diluluskan oleh pentadbir sebelum dimasukkan sebagai peserta rasmi kursus ini.
                    </p>
                  </div>
                </div>
              </div>

              {/* Back link */}
              <div className="text-center">
                <button onClick={() => { window.location.href = '/' }} className="clay-btn-secondary text-sm px-5 py-2 inline-flex items-center gap-2" style={{ background: 'var(--clay)', color: 'var(--clay-primary-dark)', borderRadius: '16px', boxShadow: 'var(--clay-shadow-sm)' }}>
                  <ArrowLeft className="w-4 h-4" /> Kembali ke e-Sijil
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* ====== NORMAL SEARCH MODE ====== */}
      {!daftarMode && (
      <>
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
      </>
      )}
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
      {activeTab === 'kursus' && <KursusTab user={user} />}
      {activeTab === 'peserta' && <PesertaTab />}
      {activeTab === 'templat' && <TemplatTab user={user} />}
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
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [deletingItem, setDeletingItem] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  // Form state
  const [formKod, setFormKod] = useState('')
  const [formNama, setFormNama] = useState('')
  const [formKeterangan, setFormKeterangan] = useState('')
  const [formWarna, setFormWarna] = useState('#7C6CF0')
  const [formStatus, setFormStatus] = useState('aktif')

  const fetchData = () => {
    setLoading(true)
    fetch('/api/kategori').then(r => r.json()).then(d => { if (d.berjaya) setData(d.data) }).finally(() => setLoading(false))
  }

  useEffect(() => {
    fetch('/api/kategori').then(r => r.json()).then(d => { if (d.berjaya) setData(d.data) }).finally(() => setLoading(false))
  }, [])

  const openAddDialog = () => {
    setEditingItem(null)
    setFormKod('')
    setFormNama('')
    setFormKeterangan('')
    setFormWarna('#7C6CF0')
    setFormStatus('aktif')
    setDialogOpen(true)
  }

  const openEditDialog = (item: any) => {
    setEditingItem(item)
    setFormKod(item.kodKategori)
    setFormNama(item.namaKategori)
    setFormKeterangan(item.keterangan || '')
    setFormWarna(item.warnaLabel)
    setFormStatus(item.status)
    setDialogOpen(true)
  }

  const openDeleteDialog = (item: any) => {
    setDeletingItem(item)
    setDeleteDialogOpen(true)
  }

  const handleSave = async () => {
    if (!formKod.trim() || !formNama.trim()) {
      toast({ title: 'Ralat', description: 'Kod dan Nama Kategori wajib diisi.', variant: 'destructive' })
      return
    }
    setSaving(true)
    try {
      const isEdit = !!editingItem
      const res = await fetch('/api/kategori', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isEdit
          ? { id: editingItem.id, kodKategori: formKod.trim(), namaKategori: formNama.trim(), keterangan: formKeterangan.trim(), warnaLabel: formWarna, status: formStatus }
          : { kodKategori: formKod.trim(), namaKategori: formNama.trim(), keterangan: formKeterangan.trim(), warnaLabel: formWarna, status: formStatus }
        ),
      })
      const result = await res.json()
      if (result.berjaya) {
        toast({ title: isEdit ? 'Kategori Dikemaskini' : 'Kategori Ditambah', description: isEdit ? 'Kategori berjaya dikemaskini.' : 'Kategori baharu berjaya ditambah.' })
        setDialogOpen(false)
        fetchData()
      } else {
        toast({ title: 'Ralat', description: result.mesej, variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Ralat', description: 'Gagal menyimpan kategori.', variant: 'destructive' })
    }
    setSaving(false)
  }

  const handleDelete = async () => {
    if (!deletingItem) return
    setSaving(true)
    try {
      const res = await fetch(`/api/kategori?id=${deletingItem.id}`, { method: 'DELETE' })
      const result = await res.json()
      if (result.berjaya) {
        toast({ title: 'Kategori Dipadam', description: 'Kategori berjaya dipadam.' })
        setDeleteDialogOpen(false)
        setDeletingItem(null)
        fetchData()
      } else {
        toast({ title: 'Ralat', description: result.mesej, variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Ralat', description: 'Gagal memadam kategori.', variant: 'destructive' })
    }
    setSaving(false)
  }

  if (loading) return <LoadingSpinner />

  const colorPresets = ['#7C6CF0', '#4FC4A1', '#E8A33D', '#E26D8E', '#5B9BD5', '#70AD47', '#FFC000', '#ED7D31', '#A5A5A5', '#4472C4']

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold" style={{ color: 'var(--clay-ink)' }}>Pengurusan Kategori Program</h3>
        <Button
          onClick={openAddDialog}
          className="clay-btn text-sm px-4 py-2 flex items-center gap-2"
          style={{ background: 'var(--clay-primary)', color: 'white', borderRadius: '20px', boxShadow: 'var(--clay-shadow-sm)' }}
        >
          <Plus className="w-4 h-4" /> Tambah Kategori
        </Button>
      </div>

      {/* Table */}
      <div className="clay-card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'var(--clay-primary)', color: 'white' }}>
                <th className="px-4 py-3 text-left rounded-tl-xl">Kod</th>
                <th className="px-4 py-3 text-left">Nama Kategori</th>
                <th className="px-4 py-3 text-left">Keterangan</th>
                <th className="px-4 py-3 text-center">Kursus</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Warna</th>
                <th className="px-4 py-3 text-center rounded-tr-xl">Tindakan</th>
              </tr>
            </thead>
            <tbody>
              {data.map((k, i) => (
                <tr key={k.id} className="group" style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(124,108,240,0.04)' }}>
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
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => openEditDialog(k)}
                        className="p-1.5 rounded-lg transition-all hover:scale-110"
                        style={{ background: 'rgba(124,108,240,0.1)', color: 'var(--clay-primary)' }}
                        title="Kemaskini"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => openDeleteDialog(k)}
                        className="p-1.5 rounded-lg transition-all hover:scale-110"
                        style={{ background: 'rgba(226,109,142,0.1)', color: 'var(--clay-destructive)' }}
                        title="Padam"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center" style={{ color: 'var(--clay-ink-soft)' }}>
                    Tiada kategori. Klik &quot;Tambah Kategori&quot; untuk menambah.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md" style={{ background: 'var(--clay)', borderRadius: '24px', boxShadow: 'var(--clay-shadow-lg)', border: '1px solid rgba(255,255,255,0.6)' }}>
          <DialogHeader>
            <DialogTitle style={{ color: 'var(--clay-ink)' }}>
              {editingItem ? 'Kemaskini Kategori' : 'Tambah Kategori Baharu'}
            </DialogTitle>
            <DialogDescription style={{ color: 'var(--clay-ink-soft)' }}>
              {editingItem ? 'Kemaskini maklumat kategori program.' : 'Isi maklumat kategori program baharu.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* Kod Kategori */}
            <div>
              <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--clay-ink)' }}>Kod Kategori <span style={{ color: 'var(--clay-destructive)' }}>*</span></label>
              <Input
                value={formKod}
                onChange={e => setFormKod(e.target.value)}
                placeholder="cth: KP, PI, BK"
                className="h-10"
                style={{ borderRadius: '16px', boxShadow: 'var(--clay-inset)', background: 'var(--clay)', border: '2px solid transparent' }}
              />
              <p className="text-xs mt-1" style={{ color: 'var(--clay-ink-soft)' }}>Kod unik ringkas (2-5 aksara)</p>
            </div>
            {/* Nama Kategori */}
            <div>
              <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--clay-ink)' }}>Nama Kategori <span style={{ color: 'var(--clay-destructive)' }}>*</span></label>
              <Input
                value={formNama}
                onChange={e => setFormNama(e.target.value)}
                placeholder="cth: Kemahiran Perdana"
                className="h-10"
                style={{ borderRadius: '16px', boxShadow: 'var(--clay-inset)', background: 'var(--clay)', border: '2px solid transparent' }}
              />
            </div>
            {/* Keterangan */}
            <div>
              <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--clay-ink)' }}>Keterangan</label>
              <Input
                value={formKeterangan}
                onChange={e => setFormKeterangan(e.target.value)}
                placeholder="Penerangan ringkas (pilihan)"
                className="h-10"
                style={{ borderRadius: '16px', boxShadow: 'var(--clay-inset)', background: 'var(--clay)', border: '2px solid transparent' }}
              />
            </div>
            {/* Warna Label */}
            <div>
              <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--clay-ink)' }}>Warna Label</label>
              <div className="flex items-center gap-2 flex-wrap">
                {colorPresets.map(c => (
                  <button
                    key={c}
                    onClick={() => setFormWarna(c)}
                    className="w-7 h-7 rounded-full transition-all hover:scale-110"
                    style={{
                      background: c,
                      border: formWarna === c ? '3px solid var(--clay-ink)' : '2px solid rgba(255,255,255,0.6)',
                      boxShadow: formWarna === c ? '0 0 0 2px rgba(124,108,240,0.3)' : 'none',
                    }}
                  />
                ))}
                <input
                  type="color"
                  value={formWarna}
                  onChange={e => setFormWarna(e.target.value)}
                  className="w-7 h-7 rounded-full cursor-pointer border-0 p-0"
                  style={{ background: 'transparent' }}
                />
              </div>
            </div>
            {/* Status */}
            <div>
              <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--clay-ink)' }}>Status</label>
              <Select value={formStatus} onValueChange={setFormStatus}>
                <SelectTrigger className="h-10" style={{ borderRadius: '16px', boxShadow: 'var(--clay-inset)', background: 'var(--clay)', border: '2px solid transparent' }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent style={{ borderRadius: '16px' }}>
                  <SelectItem value="aktif">Aktif</SelectItem>
                  <SelectItem value="arkib">Arkib</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              className="clay-btn-secondary text-sm px-4"
              style={{ background: 'var(--clay)', color: 'var(--clay-primary-dark)', borderRadius: '16px', boxShadow: 'var(--clay-shadow-sm)' }}
            >
              Batal
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="clay-btn text-sm px-5 flex items-center gap-2"
              style={{ background: 'var(--clay-primary)', color: 'white', borderRadius: '16px', boxShadow: 'var(--clay-shadow-sm)' }}
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Menyimpan...' : editingItem ? 'Kemaskini' : 'Tambah'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-sm" style={{ background: 'var(--clay)', borderRadius: '24px', boxShadow: 'var(--clay-shadow-lg)', border: '1px solid rgba(255,255,255,0.6)' }}>
          <DialogHeader>
            <DialogTitle style={{ color: 'var(--clay-destructive)' }} className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" /> Padam Kategori
            </DialogTitle>
            <DialogDescription style={{ color: 'var(--clay-ink-soft)' }}>
              Adakah anda pasti ingin memadam kategori <strong style={{ color: 'var(--clay-ink)' }}>{deletingItem?.namaKategori}</strong> ({deletingItem?.kodKategori})?
            </DialogDescription>
          </DialogHeader>
          {deletingItem && (deletingItem._count?.kursus || 0) > 0 && (
            <div className="rounded-xl p-3 text-sm" style={{ background: 'rgba(226,109,142,0.1)', color: 'var(--clay-destructive)', borderRadius: '12px' }}>
              ⚠️ {deletingItem._count?.kursus} kursus menggunakan kategori ini. Sila arkibkan sebagai ganti.
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => { setDeleteDialogOpen(false); setDeletingItem(null) }}
              className="clay-btn-secondary text-sm px-4"
              style={{ background: 'var(--clay)', color: 'var(--clay-primary-dark)', borderRadius: '16px', boxShadow: 'var(--clay-shadow-sm)' }}
            >
              Batal
            </Button>
            <Button
              onClick={handleDelete}
              disabled={saving || (deletingItem && (deletingItem._count?.kursus || 0) > 0)}
              className="text-sm px-5 flex items-center gap-2"
              style={{ background: 'var(--clay-destructive)', color: 'white', borderRadius: '16px', boxShadow: 'var(--clay-shadow-sm)' }}
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              {saving ? 'Memadam...' : 'Padam'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ============================================================
// KURSUS TAB
// ============================================================
function KursusTab({ user }: { user: AdminUser }) {
  const [data, setData] = useState<any[]>([])
  const [kategoriList, setKategoriList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [deletingItem, setDeletingItem] = useState<any>(null)
  const [viewingItem, setViewingItem] = useState<any>(null)
  const [viewPeserta, setViewPeserta] = useState<any[]>([])
  const [viewLoading, setViewLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  // Form state
  const [fKod, setFKod] = useState('')
  const [fNamaBm, setFNamaBm] = useState('')
  const [fNamaBi, setFNamaBi] = useState('')
  const [fKategoriId, setFKategoriId] = useState('')
  const [fTarikhMula, setFTarikhMula] = useState('')
  const [fTarikhTamat, setFTarikhTamat] = useState('')
  const [fTempohJam, setFTempohJam] = useState('')
  const [fPenyelaras, setFPenyelaras] = useState('')
  const [fTempat, setFTempat] = useState('ADTEC JTM Kampus Sandakan')
  const [fPenganjur, setFPenganjur] = useState('')
  const [fCatatan, setFCatatan] = useState('')
  const [fStatus, setFStatus] = useState('draf')

  // Share/QR Code state
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [shareItem, setShareItem] = useState<any>(null)
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [qrLoading, setQrLoading] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)

  // Pendaftaran Awam state
  const [pendaftaranList, setPendaftaranList] = useState<any[]>([])

  const fetchData = () => {
    setLoading(true)
    fetch('/api/kursus').then(r => r.json()).then(d => { if (d.berjaya) setData(d.data) }).finally(() => setLoading(false))
  }

  useEffect(() => {
    fetch('/api/kursus').then(r => r.json()).then(d => { if (d.berjaya) setData(d.data) }).finally(() => setLoading(false))
    fetch('/api/kategori').then(r => r.json()).then(d => { if (d.berjaya) setKategoriList(d.data) })
  }, [])

  const resetForm = () => {
    setFKod(''); setFNamaBm(''); setFNamaBi(''); setFKategoriId(''); setFTarikhMula(''); setFTarikhTamat('')
    setFTempohJam(''); setFPenyelaras(''); setFTempat('ADTEC JTM Kampus Sandakan'); setFPenganjur(''); setFCatatan(''); setFStatus('draf')
  }

  const openAddDialog = () => {
    setEditingItem(null); resetForm()
    if (kategoriList.length > 0) setFKategoriId(kategoriList[0].id)
    setDialogOpen(true)
  }

  const openEditDialog = (item: any) => {
    setEditingItem(item)
    setFKod(item.kodKursus); setFNamaBm(item.namaKursusBm); setFNamaBi(item.namaKursusBi || '')
    setFKategoriId(item.kategoriId || item.kategori?.id || '')
    setFTarikhMula(item.tarikhMula?.split('T')[0] || ''); setFTarikhTamat(item.tarikhTamat?.split('T')[0] || '')
    setFTempohJam(item.tempohJam?.toString() || ''); setFPenyelaras(item.namaPenyelaras || '')
    setFTempat(item.tempat || 'ADTEC JTM Kampus Sandakan'); setFPenganjur(item.penganjurBersama || '')
    setFCatatan(item.catatan || ''); setFStatus(item.status)
    setDialogOpen(true)
  }

  const openViewDialog = async (item: any) => {
    setViewingItem(item); setViewDialogOpen(true); setViewLoading(true)
    const res = await fetch(`/api/kursus?id=${item.id}`)
    const d = await res.json()
    if (d.berjaya) { setViewPeserta(d.data.peserta || []); setViewingItem(d.data) }
    const pendaftaranRes = await fetch(`/api/pendaftaran-awam?kursusId=${item.id}`)
    const pendaftaranData = await pendaftaranRes.json()
    if (pendaftaranData.berjaya) setPendaftaranList(pendaftaranData.data)
    setViewLoading(false)
  }

  const openDeleteDialog = (item: any) => { setDeletingItem(item); setDeleteDialogOpen(true) }

  const openShareDialog = async (item: any) => {
    setShareItem(item)
    setShareDialogOpen(true)
    setQrLoading(true)
    setLinkCopied(false)
    const baseUrl = window.location.origin
    const regLink = `${baseUrl}/?daftar=${item.id}`
    try {
      const QRCode = (await import('qrcode')).default
      const dataUrl = await QRCode.toDataURL(regLink, {
        width: 256,
        margin: 2,
        color: { dark: '#5B4ACF', light: '#F8F6FF' },
      })
      setQrDataUrl(dataUrl)
    } catch {
      setQrDataUrl('')
    }
    setQrLoading(false)
  }

  const copyLink = () => {
    const baseUrl = window.location.origin
    const regLink = `${baseUrl}/?daftar=${shareItem.id}`
    navigator.clipboard.writeText(regLink)
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 2000)
  }

  const handleLulusPendaftaran = async (id: string) => {
    try {
      const res = await fetch('/api/pendaftaran-awam', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, tindakan: 'lulus' }) })
      const result = await res.json()
      if (result.berjaya) {
        toast({ title: 'Diluluskan', description: 'Pendaftaran diluluskan dan peserta ditambah.' })
        if (viewingItem) {
          const kRes = await fetch(`/api/kursus?id=${viewingItem.id}`)
          const kData = await kRes.json()
          if (kData.berjaya) { setViewPeserta(kData.data.peserta || []); setViewingItem(kData.data) }
          const pRes = await fetch(`/api/pendaftaran-awam?kursusId=${viewingItem.id}`)
          const pData = await pRes.json()
          if (pData.berjaya) setPendaftaranList(pData.data)
        }
        fetchData()
      } else {
        toast({ title: 'Ralat', description: result.mesej, variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Ralat', description: 'Gagal meluluskan pendaftaran.', variant: 'destructive' })
    }
  }

  const handleTolakPendaftaran = async (id: string) => {
    try {
      const res = await fetch('/api/pendaftaran-awam', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, tindakan: 'tolak' }) })
      const result = await res.json()
      if (result.berjaya) {
        toast({ title: 'Ditolak', description: 'Pendaftaran ditolak.' })
        if (viewingItem) {
          const pRes = await fetch(`/api/pendaftaran-awam?kursusId=${viewingItem.id}`)
          const pData = await pRes.json()
          if (pData.berjaya) setPendaftaranList(pData.data)
        }
      } else {
        toast({ title: 'Ralat', description: result.mesej, variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Ralat', description: 'Gagal menolak pendaftaran.', variant: 'destructive' })
    }
  }

  const handleSave = async () => {
    if (!fKod.trim() || !fNamaBm.trim() || !fKategoriId || !fTarikhMula || !fTarikhTamat) {
      toast({ title: 'Ralat', description: 'Kod, Nama BM, Kategori dan Tarikh wajib diisi.', variant: 'destructive' }); return
    }
    setSaving(true)
    try {
      const isEdit = !!editingItem
      const payload: any = {
        kodKursus: fKod.trim(), namaKursusBm: fNamaBm.trim(), namaKursusBi: fNamaBi.trim(),
        kategoriId: fKategoriId, tarikhMula: fTarikhMula, tarikhTamat: fTarikhTamat,
        tempohJam: fTempohJam, namaPenyelaras: fPenyelaras, tempat: fTempat,
        penganjurBersama: fPenganjur, catatan: fCatatan, status: fStatus,
      }
      if (isEdit) payload.id = editingItem.id
      else payload.diciptaOlehId = user.id

      const res = await fetch('/api/kursus', { method: isEdit ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const result = await res.json()
      if (result.berjaya) {
        toast({ title: isEdit ? 'Kursus Dikemaskini' : 'Kursus Ditambah', description: isEdit ? 'Kursus berjaya dikemaskini.' : 'Kursus baharu berjaya ditambah.' })
        setDialogOpen(false); fetchData()
      } else {
        toast({ title: 'Ralat', description: result.mesej, variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Ralat', description: 'Gagal menyimpan kursus.', variant: 'destructive' })
    }
    setSaving(false)
  }

  const handleDelete = async () => {
    if (!deletingItem) return
    setSaving(true)
    try {
      const res = await fetch(`/api/kursus?id=${deletingItem.id}`, { method: 'DELETE' })
      const result = await res.json()
      if (result.berjaya) {
        toast({ title: 'Kursus Dipadam', description: 'Kursus berjaya dipadam.' })
        setDeleteDialogOpen(false); setDeletingItem(null); fetchData()
      } else {
        toast({ title: 'Ralat', description: result.mesej, variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Ralat', description: 'Gagal memadam kursus.', variant: 'destructive' })
    }
    setSaving(false)
  }

  if (loading) return <LoadingSpinner />

  const clayInput = { borderRadius: '16px', boxShadow: 'var(--clay-inset)', background: 'var(--clay)', border: '2px solid transparent' }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold" style={{ color: 'var(--clay-ink)' }}>Pengurusan Kursus / Program</h3>
        <Button onClick={openAddDialog} className="clay-btn text-sm px-4 py-2 flex items-center gap-2" style={{ background: 'var(--clay-primary)', color: 'white', borderRadius: '20px', boxShadow: 'var(--clay-shadow-sm)' }}>
          <Plus className="w-4 h-4" /> Tambah Kursus
        </Button>
      </div>

      <div className="clay-card p-0 overflow-hidden">
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
                <th className="px-3 py-3 text-center">Tarikh</th>
                <th className="px-3 py-3 text-center rounded-tr-xl">Tindakan</th>
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
                      style={{ background: k.status === 'aktif' ? 'var(--clay-success-bg)' : k.status === 'tamat' ? 'var(--clay-warning-bg)' : 'rgba(124,108,240,0.08)', color: k.status === 'aktif' ? 'var(--clay-success)' : k.status === 'tamat' ? 'var(--clay-warning)' : 'var(--clay-primary)' }}>
                      {k.status === 'aktif' ? 'Aktif' : k.status === 'tamat' ? 'Tamat' : k.status === 'draf' ? 'Draf' : 'Arkib'}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-xs" style={{ color: 'var(--clay-ink-soft)' }}>
                    {formatDateShort(k.tarikhMula)}<br />– {formatDateShort(k.tarikhTamat)}
                  </td>
                  <td className="px-3 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => openShareDialog(k)} className="p-1.5 rounded-lg transition-all hover:scale-110" style={{ background: 'rgba(79,196,161,0.15)', color: '#2AA68E' }} title="Kongsi Pautan Pendaftaran">
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => openViewDialog(k)} className="p-1.5 rounded-lg transition-all hover:scale-110" style={{ background: 'rgba(79,196,161,0.1)', color: 'var(--clay-success)' }} title="Papar Peserta">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => openEditDialog(k)} className="p-1.5 rounded-lg transition-all hover:scale-110" style={{ background: 'rgba(124,108,240,0.1)', color: 'var(--clay-primary)' }} title="Kemaskini">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => openDeleteDialog(k)} className="p-1.5 rounded-lg transition-all hover:scale-110" style={{ background: 'rgba(226,109,142,0.1)', color: 'var(--clay-destructive)' }} title="Padam">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-8 text-center" style={{ color: 'var(--clay-ink-soft)' }}>Tiada kursus. Klik &quot;Tambah Kursus&quot; untuk menambah.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ====== ADD / EDIT DIALOG ====== */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto" style={{ background: 'var(--clay)', borderRadius: '24px', boxShadow: 'var(--clay-shadow-lg)', border: '1px solid rgba(255,255,255,0.6)' }}>
          <DialogHeader>
            <DialogTitle style={{ color: 'var(--clay-ink)' }}>{editingItem ? 'Kemaskini Kursus' : 'Tambah Kursus Baharu'}</DialogTitle>
            <DialogDescription style={{ color: 'var(--clay-ink-soft)' }}>{editingItem ? 'Kemaskini maklumat kursus.' : 'Isi maklumat kursus / program baharu.'}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--clay-ink)' }}>Kod Kursus <span style={{ color: 'var(--clay-destructive)' }}>*</span></label>
                <Input value={fKod} onChange={e => setFKod(e.target.value)} placeholder="ADTEC-SDK/KP/2026/018" className="h-10" style={clayInput} />
              </div>
              <div>
                <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--clay-ink)' }}>Kategori <span style={{ color: 'var(--clay-destructive)' }}>*</span></label>
                <Select value={fKategoriId} onValueChange={setFKategoriId}>
                  <SelectTrigger className="h-10" style={clayInput}><SelectValue placeholder="Pilih kategori" /></SelectTrigger>
                  <SelectContent style={{ borderRadius: '16px' }}>{kategoriList.map((k: any) => <SelectItem key={k.id} value={k.id}>{k.kodKategori} — {k.namaKategori}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--clay-ink)' }}>Nama Kursus (BM) <span style={{ color: 'var(--clay-destructive)' }}>*</span></label>
              <Input value={fNamaBm} onChange={e => setFNamaBm(e.target.value)} placeholder="Pendawaian Elektrik Domestik" className="h-10" style={clayInput} />
            </div>
            <div>
              <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--clay-ink)' }}>Nama Kursus (BI)</label>
              <Input value={fNamaBi} onChange={e => setFNamaBi(e.target.value)} placeholder="Domestic Electrical Wiring" className="h-10" style={clayInput} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--clay-ink)' }}>Tarikh Mula <span style={{ color: 'var(--clay-destructive)' }}>*</span></label>
                <Input type="date" value={fTarikhMula} onChange={e => setFTarikhMula(e.target.value)} className="h-10" style={clayInput} />
              </div>
              <div>
                <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--clay-ink)' }}>Tarikh Tamat <span style={{ color: 'var(--clay-destructive)' }}>*</span></label>
                <Input type="date" value={fTarikhTamat} onChange={e => setFTarikhTamat(e.target.value)} className="h-10" style={clayInput} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--clay-ink)' }}>Tempoh (Jam)</label>
                <Input value={fTempohJam} onChange={e => setFTempohJam(e.target.value)} placeholder="80" className="h-10" style={clayInput} />
              </div>
              <div>
                <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--clay-ink)' }}>Status</label>
                <Select value={fStatus} onValueChange={setFStatus}>
                  <SelectTrigger className="h-10" style={clayInput}><SelectValue /></SelectTrigger>
                  <SelectContent style={{ borderRadius: '16px' }}>
                    <SelectItem value="draf">Draf</SelectItem>
                    <SelectItem value="aktif">Aktif</SelectItem>
                    <SelectItem value="tamat">Tamat</SelectItem>
                    <SelectItem value="arkib">Arkib</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--clay-ink)' }}>Penyelaras</label>
                <Input value={fPenyelaras} onChange={e => setFPenyelaras(e.target.value)} placeholder="Nama penyelaras" className="h-10" style={clayInput} />
              </div>
              <div>
                <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--clay-ink)' }}>Tempat</label>
                <Input value={fTempat} onChange={e => setFTempat(e.target.value)} className="h-10" style={clayInput} />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--clay-ink)' }}>Penganjur Bersama</label>
              <Input value={fPenganjur} onChange={e => setFPenganjur(e.target.value)} placeholder="Pilihan" className="h-10" style={clayInput} />
            </div>
            <div>
              <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--clay-ink)' }}>Catatan</label>
              <Input value={fCatatan} onChange={e => setFCatatan(e.target.value)} placeholder="Pilihan" className="h-10" style={clayInput} />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="clay-btn-secondary text-sm px-4" style={{ background: 'var(--clay)', color: 'var(--clay-primary-dark)', borderRadius: '16px', boxShadow: 'var(--clay-shadow-sm)' }}>Batal</Button>
            <Button onClick={handleSave} disabled={saving} className="clay-btn text-sm px-5 flex items-center gap-2" style={{ background: 'var(--clay-primary)', color: 'white', borderRadius: '16px', boxShadow: 'var(--clay-shadow-sm)' }}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Menyimpan...' : editingItem ? 'Kemaskini' : 'Tambah'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ====== VIEW DIALOG (Peserta List) ====== */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto" style={{ background: 'var(--clay)', borderRadius: '24px', boxShadow: 'var(--clay-shadow-lg)', border: '1px solid rgba(255,255,255,0.6)' }}>
          <DialogHeader>
            <DialogTitle style={{ color: 'var(--clay-ink)' }} className="flex items-center gap-2">
              <Eye className="w-5 h-5" style={{ color: 'var(--clay-success)' }} />
              {viewingItem?.namaKursusBm || 'Maklumat Kursus'}
            </DialogTitle>
            <DialogDescription style={{ color: 'var(--clay-ink-soft)' }}>
              {viewingItem?.kodKursus} · {viewingItem?.kategori?.namaKategori}
            </DialogDescription>
          </DialogHeader>

          {viewLoading ? (
            <div className="flex items-center justify-center py-8"><Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--clay-primary)' }} /></div>
          ) : (
            <div className="space-y-4">
              {/* Kursus Info Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Tarikh Mula', value: viewingItem?.tarikhMula ? formatDateShort(viewingItem.tarikhMula) : '-' },
                  { label: 'Tarikh Tamat', value: viewingItem?.tarikhTamat ? formatDateShort(viewingItem.tarikhTamat) : '-' },
                  { label: 'Tempoh', value: viewingItem?.tempohJam ? `${viewingItem.tempohJam} jam` : '-' },
                  { label: 'Penyelaras', value: viewingItem?.namaPenyelaras || '-' },
                ].map(info => (
                  <div key={info.label} className="clay-card-sm p-3 text-center">
                    <p className="text-xs" style={{ color: 'var(--clay-ink-soft)' }}>{info.label}</p>
                    <p className="font-semibold text-sm" style={{ color: 'var(--clay-ink)' }}>{info.value}</p>
                  </div>
                ))}
              </div>

              {/* Peserta Table */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-sm" style={{ color: 'var(--clay-ink)' }}>
                    Senarai Peserta ({viewPeserta.length})
                  </h4>
                  <span className="text-xs" style={{ color: 'var(--clay-ink-soft)' }}>
                    {(viewingItem?._count?.sijil || viewPeserta.reduce((a: number, p: any) => a + (p.sijil?.length || 0), 0))} sijil dijana
                  </span>
                </div>
                <div className="rounded-xl overflow-hidden" style={{ boxShadow: 'var(--clay-shadow-sm)' }}>
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ background: 'rgba(124,108,240,0.08)' }}>
                        <th className="px-3 py-2 text-left text-xs" style={{ color: 'var(--clay-primary)' }}>#</th>
                        <th className="px-3 py-2 text-left text-xs" style={{ color: 'var(--clay-primary)' }}>Nama Penuh</th>
                        <th className="px-3 py-2 text-left text-xs" style={{ color: 'var(--clay-primary)' }}>No. MyKad</th>
                        <th className="px-3 py-2 text-center text-xs" style={{ color: 'var(--clay-primary)' }}>Kelayakan</th>
                        <th className="px-3 py-2 text-center text-xs" style={{ color: 'var(--clay-primary)' }}>Sijil</th>
                      </tr>
                    </thead>
                    <tbody>
                      {viewPeserta.map((p: any, idx: number) => (
                        <tr key={p.id} style={{ background: idx % 2 === 0 ? 'var(--clay)' : 'rgba(124,108,240,0.03)' }}>
                          <td className="px-3 py-2 text-xs" style={{ color: 'var(--clay-ink-soft)' }}>{idx + 1}</td>
                          <td className="px-3 py-2 font-medium" style={{ color: 'var(--clay-ink)' }}>{p.namaPenuh}</td>
                          <td className="px-3 py-2 font-mono text-xs" style={{ color: 'var(--clay-ink-secondary)' }}>{p.noMykad}</td>
                          <td className="px-3 py-2 text-center">
                            <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold"
                              style={{ background: p.statusKelayakan === 'layak' ? 'var(--clay-success-bg)' : 'var(--clay-warning-bg)', color: p.statusKelayakan === 'layak' ? 'var(--clay-success)' : 'var(--clay-warning)' }}>
                              {p.statusKelayakan === 'layak' ? 'Layak' : 'Tidak Layak'}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-center">
                            {p.sijil && p.sijil.length > 0 ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: 'var(--clay-success-bg)', color: 'var(--clay-success)' }}>
                                <CheckCircle2 className="w-3 h-3" /> {p.sijil.length}
                              </span>
                            ) : (
                              <span className="text-xs" style={{ color: 'var(--clay-ink-soft)' }}>—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                      {viewPeserta.length === 0 && (
                        <tr><td colSpan={5} className="px-3 py-6 text-center text-xs" style={{ color: 'var(--clay-ink-soft)' }}>Tiada peserta berdaftar.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pendaftaran Menunggu Kelulusan */}
              {pendaftaranList.filter((p: any) => p.status === 'menunggu').length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-sm flex items-center gap-2" style={{ color: 'var(--clay-ink)' }}>
                      <Clock className="w-4 h-4" style={{ color: 'var(--clay-warning)' }} />
                      Pendaftaran Menunggu Kelulusan ({pendaftaranList.filter((p: any) => p.status === 'menunggu').length})
                    </h4>
                  </div>
                  <div className="rounded-xl overflow-hidden" style={{ boxShadow: 'var(--clay-shadow-sm)' }}>
                    <table className="w-full text-sm">
                      <thead>
                        <tr style={{ background: 'rgba(232,163,61,0.08)' }}>
                          <th className="px-3 py-2 text-left text-xs" style={{ color: 'var(--clay-warning)' }}>#</th>
                          <th className="px-3 py-2 text-left text-xs" style={{ color: 'var(--clay-warning)' }}>Nama</th>
                          <th className="px-3 py-2 text-left text-xs" style={{ color: 'var(--clay-warning)' }}>No. MyKad</th>
                          <th className="px-3 py-2 text-left text-xs" style={{ color: 'var(--clay-warning)' }}>Telefon</th>
                          <th className="px-3 py-2 text-left text-xs" style={{ color: 'var(--clay-warning)' }}>Emel</th>
                          <th className="px-3 py-2 text-center text-xs" style={{ color: 'var(--clay-warning)' }}>Tarikh</th>
                          <th className="px-3 py-2 text-center text-xs" style={{ color: 'var(--clay-warning)' }}>Tindakan</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pendaftaranList.filter((p: any) => p.status === 'menunggu').map((p: any, idx: number) => (
                          <tr key={p.id} style={{ background: idx % 2 === 0 ? 'var(--clay)' : 'rgba(232,163,61,0.03)' }}>
                            <td className="px-3 py-2 text-xs" style={{ color: 'var(--clay-ink-soft)' }}>{idx + 1}</td>
                            <td className="px-3 py-2 font-medium" style={{ color: 'var(--clay-ink)' }}>{p.namaPenuh}</td>
                            <td className="px-3 py-2 font-mono text-xs" style={{ color: 'var(--clay-ink-secondary)' }}>{p.noMykad}</td>
                            <td className="px-3 py-2 text-xs" style={{ color: 'var(--clay-ink-secondary)' }}>{p.noTelefon || '—'}</td>
                            <td className="px-3 py-2 text-xs" style={{ color: 'var(--clay-ink-secondary)' }}>{p.emel || '—'}</td>
                            <td className="px-3 py-2 text-center text-xs" style={{ color: 'var(--clay-ink-soft)' }}>{formatDateShort(p.diciptaPada)}</td>
                            <td className="px-3 py-2 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <button onClick={() => handleLulusPendaftaran(p.id)} className="p-1 rounded-lg transition-all hover:scale-110" style={{ background: 'var(--clay-success-bg)', color: 'var(--clay-success)' }} title="Luluskan">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                </button>
                                <button onClick={() => handleTolakPendaftaran(p.id)} className="p-1 rounded-lg transition-all hover:scale-110" style={{ background: 'var(--clay-danger-bg)', color: 'var(--clay-danger)' }} title="Tolak">
                                  <XCircle className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ====== DELETE DIALOG ====== */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-sm" style={{ background: 'var(--clay)', borderRadius: '24px', boxShadow: 'var(--clay-shadow-lg)', border: '1px solid rgba(255,255,255,0.6)' }}>
          <DialogHeader>
            <DialogTitle style={{ color: 'var(--clay-destructive)' }} className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" /> Padam Kursus
            </DialogTitle>
            <DialogDescription style={{ color: 'var(--clay-ink-soft)' }}>
              Adakah anda pasti ingin memadam kursus <strong style={{ color: 'var(--clay-ink)' }}>{deletingItem?.namaKursusBm}</strong>?
            </DialogDescription>
          </DialogHeader>
          {deletingItem && (deletingItem._count?.sijil || 0) > 0 && (
            <div className="rounded-xl p-3 text-sm" style={{ background: 'rgba(226,109,142,0.1)', color: 'var(--clay-destructive)', borderRadius: '12px' }}>
              ⚠️ {deletingItem._count?.sijil} sijil telah dijana. Sila arkibkan kursus sebagai ganti.
            </div>
          )}
          {deletingItem && (deletingItem._count?.sijil || 0) === 0 && (deletingItem._count?.peserta || 0) > 0 && (
            <div className="rounded-xl p-3 text-sm" style={{ background: 'rgba(232,163,61,0.1)', color: 'var(--clay-warning)', borderRadius: '12px' }}>
              ⚠️ {deletingItem._count?.peserta} peserta akan turut dipadam.
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { setDeleteDialogOpen(false); setDeletingItem(null) }} className="clay-btn-secondary text-sm px-4" style={{ background: 'var(--clay)', color: 'var(--clay-primary-dark)', borderRadius: '16px', boxShadow: 'var(--clay-shadow-sm)' }}>Batal</Button>
            <Button onClick={handleDelete} disabled={saving || (deletingItem && (deletingItem._count?.sijil || 0) > 0)} className="text-sm px-5 flex items-center gap-2" style={{ background: 'var(--clay-destructive)', color: 'white', borderRadius: '16px', boxShadow: 'var(--clay-shadow-sm)' }}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              {saving ? 'Memadam...' : 'Padam'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ====== SHARE / QR CODE DIALOG ====== */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="sm:max-w-md" style={{ background: 'var(--clay)', borderRadius: '24px', boxShadow: 'var(--clay-shadow-lg)', border: '1px solid rgba(255,255,255,0.6)' }}>
          <DialogHeader>
            <DialogTitle style={{ color: 'var(--clay-ink)' }} className="flex items-center gap-2">
              <QrCode className="w-5 h-5" style={{ color: 'var(--clay-primary)' }} />
              Pautan Pendaftaran Kursus
            </DialogTitle>
            <DialogDescription style={{ color: 'var(--clay-ink-soft)' }}>
              Kongsi pautan atau QR code ini kepada peserta untuk mendaftar kursus <strong style={{ color: 'var(--clay-ink)' }}>{shareItem?.namaKursusBm}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* QR Code */}
            <div className="clay-card-sm p-4 flex flex-col items-center">
              {qrLoading ? (
                <div className="w-48 h-48 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--clay-primary)' }} />
                </div>
              ) : qrDataUrl ? (
                <>
                  <img src={qrDataUrl} alt="QR Code Pendaftaran" className="w-48 h-48 rounded-xl" />
                  <p className="text-xs mt-2" style={{ color: 'var(--clay-ink-soft)' }}>Imbas QR code untuk mendaftar</p>
                </>
              ) : (
                <p className="text-sm" style={{ color: 'var(--clay-danger)' }}>Gagal menjana QR code</p>
              )}
            </div>
            {/* Link */}
            <div className="clay-card-sm p-3">
              <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--clay-ink-soft)' }}>Pautan Pendaftaran</label>
              <div className="flex items-center gap-2">
                <div className="flex-1 px-3 py-2 rounded-xl text-xs font-mono break-all" style={{ background: 'var(--clay-inset-bg, rgba(124,108,240,0.06))', color: 'var(--clay-primary)', boxShadow: 'var(--clay-inset)' }}>
                  {typeof window !== 'undefined' ? `${window.location.origin}/?daftar=${shareItem?.id}` : ''}
                </div>
                <button
                  onClick={copyLink}
                  className="p-2 rounded-xl transition-all hover:scale-105"
                  style={{ background: linkCopied ? 'var(--clay-success-bg)' : 'var(--clay-primary)', color: linkCopied ? 'var(--clay-success)' : 'white', boxShadow: 'var(--clay-shadow-sm)' }}
                  title="Salin Pautan"
                >
                  {linkCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {/* Info */}
            <div className="flex items-start gap-2 p-3 rounded-xl" style={{ background: 'rgba(79,196,161,0.08)' }}>
              <Info className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--clay-success)' }} />
              <p className="text-xs" style={{ color: 'var(--clay-ink-secondary)' }}>
                Peserta yang mendaftar melalui pautan ini perlu diluluskan oleh pentadbir sebelum dimasukkan sebagai peserta rasmi.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShareDialogOpen(false)} className="clay-btn-secondary text-sm px-4" style={{ background: 'var(--clay)', color: 'var(--clay-primary-dark)', borderRadius: '16px', boxShadow: 'var(--clay-shadow-sm)' }}>Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
// TEMPLAT TAB - with full editor
// ============================================================

// Available dynamic fields for certificate templates
const MEDAN_SENARAI = [
  { kunci: 'nama_penuh', label: 'Nama Penuh', contoh: 'AMIRUL BIN ABDULLAH' },
  { kunci: 'no_mykad', label: 'No. MyKad', contoh: '901231-12-5678' },
  { kunci: 'nama_kursus', label: 'Nama Kursus (BM)', contoh: 'Pendawaian Elektrik Domestik' },
  { kunci: 'nama_kursus_bi', label: 'Nama Kursus (BI)', contoh: 'Domestic Electrical Wiring' },
  { kunci: 'kategori_program', label: 'Kategori Program', contoh: 'Kursus Pendek' },
  { kunci: 'julat_tarikh', label: 'Julat Tarikh', contoh: '6 Januari – 10 Januari 2026' },
  { kunci: 'tempoh_jam', label: 'Tempoh (jam)', contoh: '40 jam' },
  { kunci: 'no_siri', label: 'No. Siri', contoh: 'ADTEC/SDK/2026/KP/00001' },
  { kunci: 'qr_pengesahan', label: 'QR Pengesahan', contoh: '[QR CODE]' },
  { kunci: 'tarikh_dijana', label: 'Tarikh Dijana', contoh: '10 Ogos 2026' },
  { kunci: 'nama_institusi', label: 'Nama Institusi', contoh: 'ADTEC JTM Kampus Sandakan' },
  { kunci: 'tempat', label: 'Tempat', contoh: 'ADTEC JTM Kampus Sandakan' },
]

const FON_SENARAI = ['Times New Roman', 'Arial', 'Helvetica', 'Courier New', 'Georgia', 'Verdana', 'Poppins']
const GAYA_FON_SENARAI = [
  { nilai: 'normal', label: 'Biasa' },
  { nilai: 'tebal', label: 'Tebal' },
  { nilai: 'condong', label: 'Condong' },
  { nilai: 'tebal_condong', label: 'Tebal Condong' },
]
const PENJAJARAN_SENARAI = [
  { nilai: 'kiri', label: 'Kiri', icon: AlignLeft },
  { nilai: 'tengah', label: 'Tengah', icon: AlignCenter },
  { nilai: 'kanan', label: 'Kanan', icon: AlignRight },
]

function TemplatTab({ user }: { user: AdminUser }) {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editingTemplate, setEditingTemplate] = useState<any>(null)
  const [statusLoading, setStatusLoading] = useState<string | null>(null)
  const [orientasiFilter, setOrientasiFilter] = useState<string>('semua') // semua | landskap | potret
  const [showNewDialog, setShowNewDialog] = useState(false)
  const { toast } = useToast()

  const fetchData = useCallback(() => {
    setLoading(true)
    fetch('/api/templat').then(r => r.json()).then(d => { if (d.berjaya) setData(d.data) }).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetch('/api/templat').then(r => r.json()).then(d => { if (d.berjaya) setData(d.data) }).finally(() => setLoading(false))
  }, [])

  const handleToggleStatus = async (templateId: string, newStatus: string) => {
    setStatusLoading(templateId)
    try {
      const res = await fetch('/api/templat', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templatId: templateId, status: newStatus }),
      })
      const result = await res.json()
      if (result.berjaya) {
        toast({ title: 'Status Dikemaskini', description: newStatus === 'aktif' ? 'Templat diaktifkan. Templat lain dinyahaktifkan secara automatik.' : 'Templat dinyahaktifkan.' })
        fetchData()
      } else {
        toast({ title: 'Ralat', description: result.mesej || 'Gagal mengemaskini status.', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Ralat', description: 'Gagal mengemaskini status templat.', variant: 'destructive' })
    }
    setStatusLoading(null)
  }

  if (loading) return <LoadingSpinner />

  // If editing a template, show the editor
  if (editingTemplate) {
    return (
      <TemplateEditor
        template={editingTemplate}
        onSave={async (updatedMedan: any[]) => {
          try {
            const isNew = editingTemplate.id === 'new'
            let templatId = editingTemplate.id

            if (isNew) {
              // Create template first via POST
              const createRes = await fetch('/api/templat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  namaTemplat: editingTemplate.namaTemplat,
                  keterangan: editingTemplate.keterangan,
                  orientasi: editingTemplate.orientasi,
                  saizKertas: editingTemplate.saizKertas,
                  dimuatNaikOlehId: user.id,
                  medan: updatedMedan,
                }),
              })
              const createResult = await createRes.json()
              if (createResult.berjaya) {
                templatId = createResult.data.id
              } else {
                toast({ title: 'Ralat', description: createResult.mesej || 'Gagal mencipta templat.', variant: 'destructive' })
                return
              }
            } else {
              // Update existing template fields via PUT
              const res = await fetch('/api/templat', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ templatId, medan: updatedMedan }),
              })
              const result = await res.json()
              if (!result.berjaya) {
                toast({ title: 'Ralat', description: result.mesej, variant: 'destructive' })
                return
              }
            }

            toast({ title: 'Templat Disimpan', description: isNew ? 'Templat baharu berjaya dicipta.' : 'Medan templat berjaya dikemaskini.' })
            setEditingTemplate(null)
            setLoading(true)
            fetch('/api/templat').then(r => r.json()).then(d => { if (d.berjaya) setData(d.data) }).finally(() => setLoading(false))
          } catch {
            toast({ title: 'Ralat', description: 'Gagal menyimpan templat.', variant: 'destructive' })
          }
        }}
        onClose={() => setEditingTemplate(null)}
      />
    )
  }

  // Filter templates by orientation
  const filteredData = orientasiFilter === 'semua' ? data : data.filter((t: any) => t.orientasi === orientasiFilter)
  const landskapCount = data.filter((t: any) => t.orientasi === 'landskap').length
  const potretCount = data.filter((t: any) => t.orientasi === 'potret').length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="font-semibold" style={{ color: 'var(--clay-ink)' }}>Galeri Templat Sijil</h3>
        <Button
          onClick={() => setShowNewDialog(true)}
          className="clay-btn text-sm px-4 py-2 flex items-center gap-2"
          style={{ background: 'var(--clay-primary)', color: 'white', borderRadius: '20px', boxShadow: 'var(--clay-shadow-sm)' }}
        >
          <Plus className="w-4 h-4" /> Templat Baharu
        </Button>
      </div>

      {/* Orientation Filter Tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setOrientasiFilter('semua')}
          className="px-4 py-2 rounded-2xl text-sm font-semibold transition-all flex items-center gap-2"
          style={{
            background: orientasiFilter === 'semua' ? 'var(--clay-primary)' : 'var(--clay-bg)',
            color: orientasiFilter === 'semua' ? 'white' : 'var(--clay-ink-secondary)',
            border: `1.5px solid ${orientasiFilter === 'semua' ? 'var(--clay-primary)' : 'var(--border)'}`,
            boxShadow: orientasiFilter === 'semua' ? 'var(--clay-shadow-sm)' : 'none',
          }}
        >
          <LayoutDashboard className="w-4 h-4" />
          Semua
          <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px]" style={{ background: orientasiFilter === 'semua' ? 'rgba(255,255,255,0.2)' : 'rgba(124,108,240,0.1)' }}>
            {data.length}
          </span>
        </button>
        <button
          onClick={() => setOrientasiFilter('landskap')}
          className="px-4 py-2 rounded-2xl text-sm font-semibold transition-all flex items-center gap-2"
          style={{
            background: orientasiFilter === 'landskap' ? 'var(--clay-primary)' : 'var(--clay-bg)',
            color: orientasiFilter === 'landskap' ? 'white' : 'var(--clay-ink-secondary)',
            border: `1.5px solid ${orientasiFilter === 'landskap' ? 'var(--clay-primary)' : 'var(--border)'}`,
            boxShadow: orientasiFilter === 'landskap' ? 'var(--clay-shadow-sm)' : 'none',
          }}
        >
          {/* Landscape icon: wide rectangle */}
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="1" y="3" width="14" height="10" rx="2" />
          </svg>
          Landskap
          <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px]" style={{ background: orientasiFilter === 'landskap' ? 'rgba(255,255,255,0.2)' : 'rgba(124,108,240,0.1)' }}>
            {landskapCount}
          </span>
        </button>
        <button
          onClick={() => setOrientasiFilter('potret')}
          className="px-4 py-2 rounded-2xl text-sm font-semibold transition-all flex items-center gap-2"
          style={{
            background: orientasiFilter === 'potret' ? 'var(--clay-primary)' : 'var(--clay-bg)',
            color: orientasiFilter === 'potret' ? 'white' : 'var(--clay-ink-secondary)',
            border: `1.5px solid ${orientasiFilter === 'potret' ? 'var(--clay-primary)' : 'var(--border)'}`,
            boxShadow: orientasiFilter === 'potret' ? 'var(--clay-shadow-sm)' : 'none',
          }}
        >
          {/* Portrait icon: tall rectangle */}
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="1" width="10" height="14" rx="2" />
          </svg>
          Potret
          <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px]" style={{ background: orientasiFilter === 'potret' ? 'rgba(255,255,255,0.2)' : 'rgba(124,108,240,0.1)' }}>
            {potretCount}
          </span>
        </button>
      </div>

      {/* New Template Dialog */}
      {showNewDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="clay-card-lg p-6 max-w-md w-full mx-4" style={{ borderRadius: '24px' }}>
            <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--clay-ink)' }}>Pilih Orientasi Templat</h3>
            <p className="text-sm mb-5" style={{ color: 'var(--clay-ink-soft)' }}>Pilih susun atur templat sijil yang ingin dicipta:</p>
            <div className="grid grid-cols-2 gap-4 mb-5">
              {/* Landscape Option */}
              <button
                onClick={() => {
                  setEditingTemplate({
                    id: 'new',
                    namaTemplat: 'Templat Landskap',
                    keterangan: '',
                    orientasi: 'landskap',
                    saizKertas: 'a4',
                    medanTemplat: [],
                    status: 'draf',
                    versi: 1,
                  })
                  setShowNewDialog(false)
                }}
                className="clay-card p-5 flex flex-col items-center gap-3 transition-all hover:scale-[1.03]"
                style={{ borderRadius: '20px', border: '2px solid var(--clay-primary)' }}
              >
                {/* Landscape preview shape */}
                <div className="rounded-lg flex items-center justify-center" style={{
                  width: '80px', height: '56px',
                  background: 'linear-gradient(135deg, #f8f9ff, #eef0fa)',
                  border: '2px dashed var(--clay-primary)',
                  aspectRatio: '297/210',
                }}>
                  <svg width="28" height="20" viewBox="0 0 28 20" fill="none" stroke="var(--clay-primary)" strokeWidth="1.5" opacity="0.6">
                    <rect x="1" y="1" width="26" height="18" rx="3" />
                    <line x1="1" y1="6" x2="27" y2="6" />
                    <line x1="8" y1="6" x2="8" y2="19" />
                  </svg>
                </div>
                <div className="text-center">
                  <p className="font-bold text-sm" style={{ color: 'var(--clay-ink)' }}>Landskap</p>
                  <p className="text-xs" style={{ color: 'var(--clay-ink-soft)' }}>A4 Mendatar (297×210mm)</p>
                </div>
              </button>
              {/* Portrait Option */}
              <button
                onClick={() => {
                  setEditingTemplate({
                    id: 'new',
                    namaTemplat: 'Templat Potret',
                    keterangan: '',
                    orientasi: 'potret',
                    saizKertas: 'a4',
                    medanTemplat: [],
                    status: 'draf',
                    versi: 1,
                  })
                  setShowNewDialog(false)
                }}
                className="clay-card p-5 flex flex-col items-center gap-3 transition-all hover:scale-[1.03]"
                style={{ borderRadius: '20px', border: '2px solid var(--clay-success)' }}
              >
                {/* Portrait preview shape */}
                <div className="rounded-lg flex items-center justify-center" style={{
                  width: '56px', height: '80px',
                  background: 'linear-gradient(135deg, #f0faf6, #e8f5f0)',
                  border: '2px dashed var(--clay-success)',
                  aspectRatio: '210/297',
                }}>
                  <svg width="20" height="28" viewBox="0 0 20 28" fill="none" stroke="var(--clay-success)" strokeWidth="1.5" opacity="0.6">
                    <rect x="1" y="1" width="18" height="26" rx="3" />
                    <line x1="1" y1="6" x2="19" y2="6" />
                    <line x1="7" y1="6" x2="7" y2="27" />
                  </svg>
                </div>
                <div className="text-center">
                  <p className="font-bold text-sm" style={{ color: 'var(--clay-ink)' }}>Potret</p>
                  <p className="text-xs" style={{ color: 'var(--clay-ink-soft)' }}>A4 Menegak (210×297mm)</p>
                </div>
              </button>
            </div>
            <button
              onClick={() => setShowNewDialog(false)}
              className="w-full py-2.5 rounded-2xl text-sm font-semibold transition-all"
              style={{ background: 'var(--clay-bg)', color: 'var(--clay-ink-soft)', border: '1.5px solid var(--border)' }}
            >
              Batal
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredData.map((t: any) => (
          <div key={t.id} className="clay-card p-5 cursor-pointer group transition-all" 
            style={{ 
              border: t.status === 'aktif' ? '2px solid var(--clay-success)' : undefined,
              boxShadow: t.status === 'aktif' ? '0 0 0 3px rgba(34,197,94,0.12)' : undefined,
            }}
            onClick={() => setEditingTemplate(t)}>
            {/* Template preview with field positions */}
            <div className="rounded-xl mb-4 relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #f8f9ff, #eef0fa)',
                aspectRatio: t.orientasi === 'landskap' ? '297/210' : '210/297',
                border: '2px dashed var(--border)',
              }}>
              {/* Active badge on preview */}
              {t.status === 'aktif' && (
                <div className="absolute top-2 right-2 z-20 px-2 py-0.5 rounded-full text-[9px] font-bold flex items-center gap-1"
                  style={{ background: 'var(--clay-success)', color: 'white', boxShadow: '0 1px 4px rgba(34,197,94,0.3)' }}
                >
                  <CheckCircle2 className="w-2.5 h-2.5" /> Aktif
                </div>
              )}
              {/* Render field positions as dots */}
              {(t.medanTemplat || []).map((m: any, i: number) => (
                <div key={i}
                  className="absolute flex items-center justify-center"
                  style={{
                    left: `${m.posXPeratus}%`,
                    top: `${m.posYPeratus}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  <div className="px-1.5 py-0.5 rounded text-[6px] font-medium whitespace-nowrap"
                    style={{
                      background: m.jenisElemen === 'qr' ? 'rgba(226,109,142,0.15)' : 'rgba(124,108,240,0.12)',
                      color: m.jenisElemen === 'qr' ? 'var(--clay-danger)' : 'var(--clay-primary)',
                      border: `1px solid ${m.jenisElemen === 'qr' ? 'rgba(226,109,142,0.3)' : 'rgba(124,108,240,0.25)'}`,
                    }}
                  >
                    {m.kunciMedan.replace(/_/g, ' ')}
                  </div>
                </div>
              ))}
              {/* Edit overlay */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: 'rgba(124,108,240,0.08)' }}
              >
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
                  style={{ background: 'var(--clay-primary)', color: 'white' }}
                >
                  <Edit2 className="w-3 h-3" /> <span className="text-xs font-medium">Edit Templat</span>
                </div>
              </div>
            </div>
            <h4 className="font-semibold text-sm mb-1" style={{ color: 'var(--clay-ink)' }}>{t.namaTemplat}</h4>
            <p className="text-xs mb-2" style={{ color: 'var(--clay-ink-soft)' }}>{t.keterangan || 'Tiada keterangan'}</p>
            {/* Orientation badge */}
            <div className="flex items-center gap-1.5 mb-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                style={{
                  background: t.orientasi === 'landskap' ? 'rgba(124,108,240,0.1)' : 'rgba(34,197,94,0.1)',
                  color: t.orientasi === 'landskap' ? 'var(--clay-primary)' : 'var(--clay-success)',
                  border: `1px solid ${t.orientasi === 'landskap' ? 'rgba(124,108,240,0.25)' : 'rgba(34,197,94,0.25)'}`,
                }}
              >
                {t.orientasi === 'landskap' ? (
                  <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="14" height="10" rx="2" /></svg>
                ) : (
                  <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="1" width="10" height="14" rx="2" /></svg>
                )}
                {t.orientasi === 'landskap' ? 'Landskap' : 'Potret'}
              </span>
              <span className="text-[10px]" style={{ color: 'var(--clay-ink-soft)' }}>A4 · v{t.versi} · {t.medanTemplat?.length || 0} medan</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Switch
                  checked={t.status === 'aktif'}
                  onCheckedChange={(checked) => {
                    handleToggleStatus(t.id, checked ? 'aktif' : 'tidak_aktif')
                  }}
                  disabled={statusLoading === t.id}
                  className="scale-110"
                />
                <span className="text-xs font-semibold" style={{ color: t.status === 'aktif' ? 'var(--clay-success)' : 'var(--clay-ink-soft)' }}>
                  {statusLoading === t.id ? (
                    <Loader2 className="w-3 h-3 animate-spin inline mr-1" />
                  ) : t.status === 'aktif' ? (
                    <CheckCircle2 className="w-3 h-3 inline mr-1" />
                  ) : (
                    <XCircle className="w-3 h-3 inline mr-1" />
                  )}
                  {t.status === 'aktif' ? 'Aktif' : 'Tidak Aktif'}
                </span>
              </div>
              <span className="text-[10px]" style={{ color: 'var(--clay-ink-soft)' }}>
                v{t.versi} · {t.medanTemplat?.length || 0} medan
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================================
// TEMPLATE EDITOR - Drag & Drop Field Mapping
// ============================================================
function TemplateEditor({ template, onSave, onClose }: {
  template: any
  onSave: (medan: any[]) => void
  onClose: () => void
}) {
  const [medan, setMedan] = useState<any[]>(template.medanTemplat || [])
  const [selectedField, setSelectedField] = useState<number | null>(null)
  const [dragging, setDragging] = useState<number | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const canvasRef = useRef<HTMLDivElement>(null)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  // Tandatangan digital
  const [tandatanganPengarah, setTandatanganPengarah] = useState<string>(template.laluanTandatanganPengarah || '')
  const [tandatanganPenyelaras, setTandatanganPenyelaras] = useState<string>(template.laluanTandatanganPenyelaras || '')
  const [jawatanPenandatangan, setJawatanPenandatangan] = useState<string>(template.jawatanPenandatangan || 'Pengarah')
  const [namaPenandatangan, setNamaPenandatangan] = useState<string>(template.namaPenandatangan || '')
  const [jawatanCustom, setJawatanCustom] = useState<string>('')
  const [jawatanMode, setJawatanMode] = useState<string>(() => {
    const preset = ['Pengarah', 'Timbalan Pengarah Latihan', 'Timbalan Pengarah Operasi']
    return preset.includes(template.jawatanPenandatangan || 'Pengarah') ? 'preset' : 'custom'
  })
  const [uploadingSig, setUploadingSig] = useState<string | null>(null) // 'pengarah' | 'penyelaras' | null
  const pengarahInputRef = useRef<HTMLInputElement>(null)
  const penyelarasInputRef = useRef<HTMLInputElement>(null)

  const isLandscape = template.orientasi === 'landskap'

  // Add a new field
  const addField = (kunci: string) => {
    const def = MEDAN_SENARAI.find(m => m.kunci === kunci)
    if (!def) return
    const newField = {
      kunciMedan: kunci,
      jenisElemen: kunci === 'qr_pengesahan' ? 'qr' : 'teks',
      posXPeratus: 50,
      posYPeratus: 50,
      lebarPeratus: kunci === 'qr_pengesahan' ? 10 : 40,
      keluargaFon: 'Times New Roman',
      saizFon: kunci === 'nama_penuh' ? 36 : kunci === 'nama_kursus' ? 24 : 18,
      warnaFon: '#1a1a2e',
      gayaFon: kunci === 'nama_penuh' || kunci === 'nama_kursus' ? 'tebal' : 'normal',
      penjajaran: 'tengah',
      autoKecil: true,
    }
    setMedan([...medan, newField])
    setSelectedField(medan.length)
  }

  // Remove a field
  const removeField = (index: number) => {
    const newMedan = medan.filter((_: any, i: number) => i !== index)
    setMedan(newMedan)
    if (selectedField === index) setSelectedField(null)
    else if (selectedField !== null && selectedField > index) setSelectedField(selectedField - 1)
  }

  // Update a field property
  const updateField = (index: number, key: string, value: any) => {
    const newMedan = [...medan]
    newMedan[index] = { ...newMedan[index], [key]: value }
    setMedan(newMedan)
  }

  // Mouse handlers for drag
  const handleMouseDown = (e: React.MouseEvent, index: number) => {
    e.preventDefault()
    e.stopPropagation()
    setDragging(index)
    setSelectedField(index)
    const rect = canvasRef.current?.getBoundingClientRect()
    if (rect) {
      const fieldEl = e.currentTarget as HTMLElement
      const fieldRect = fieldEl.getBoundingClientRect()
      setDragOffset({
        x: e.clientX - fieldRect.left - fieldRect.width / 2,
        y: e.clientY - fieldRect.top - fieldRect.height / 2,
      })
    }
  }

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (dragging === null || !canvasRef.current) return
    const rect = canvasRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    const clampedX = Math.max(5, Math.min(95, x))
    const clampedY = Math.max(5, Math.min(95, y))
    setMedan(prev => {
      const newMedan = [...prev]
      if (dragging !== null && newMedan[dragging]) {
        newMedan[dragging] = { ...newMedan[dragging], posXPeratus: Math.round(clampedX * 10) / 10, posYPeratus: Math.round(clampedY * 10) / 10 }
      }
      return newMedan
    })
  }, [dragging])

  const handleMouseUp = useCallback(() => {
    setDragging(null)
  }, [])

  // Save handler
  const handleSave = async () => {
    // Validate: must have nama_penuh and nama_kursus
    const hasNama = medan.some((m: any) => m.kunciMedan === 'nama_penuh')
    const hasKursus = medan.some((m: any) => m.kunciMedan === 'nama_kursus')
    if (!hasNama || !hasKursus) {
      toast({
        title: 'Medan Wajib Hilang',
        description: 'Templat mesti mempunyai medan Nama Penuh dan Nama Kursus.',
        variant: 'destructive',
      })
      return
    }
    setSaving(true)
    // Save signature paths to template first (if not new)
    if (template.id !== 'new') {
      try {
        await fetch('/api/templat', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            templatId: template.id,
            laluanTandatanganPengarah: tandatanganPengarah || null,
            laluanTandatanganPenyelaras: tandatanganPenyelaras || null,
            jawatanPenandatangan: jawatanPenandatangan || null,
            namaPenandatangan: namaPenandatangan || null,
          }),
        })
      } catch {}
    }
    await onSave(medan)
    setSaving(false)
  }

  const selectedFieldData = selectedField !== null ? medan[selectedField] : null

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            onClick={onClose}
            className="clay-btn-secondary text-sm px-3 py-2"
            variant="outline"
            style={{ background: 'var(--clay)', color: 'var(--clay-primary-dark)', borderRadius: '16px', boxShadow: 'var(--clay-shadow-sm)' }}
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Kembali
          </Button>
          <div>
            <h3 className="font-semibold" style={{ color: 'var(--clay-ink)' }}>Editor Templat Sijil</h3>
            <p className="text-xs" style={{ color: 'var(--clay-ink-soft)' }}>{template.namaTemplat}</p>
          </div>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="clay-btn text-sm px-5 py-2 flex items-center gap-2"
          style={{ background: 'var(--clay-primary)', color: 'white', borderRadius: '20px', boxShadow: 'var(--clay-shadow-sm)' }}
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Menyimpan...' : 'Simpan Templat'}
        </Button>
      </div>

      {/* Main Editor Area */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Canvas */}
        <div className="flex-1">
          <div className="clay-card-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium" style={{ color: 'var(--clay-ink-soft)' }}>
                Kanvas Templat — {isLandscape ? 'Landskap' : 'Potret'} {template.saizKertas?.toUpperCase()}
              </span>
              <span className="text-xs" style={{ color: 'var(--clay-ink-soft)' }}>
                Seret medan untuk mengubah kedudukan
              </span>
            </div>
            {/* Canvas */}
            <div
              ref={canvasRef}
              className="relative mx-auto rounded-lg overflow-hidden cursor-crosshair"
              style={{
                width: '100%',
                aspectRatio: isLandscape ? '297/210' : '210/297',
                background: 'linear-gradient(135deg, #fafbff 0%, #f0f1f8 50%, #e8eaf4 100%)',
                border: '2px solid var(--border)',
                boxShadow: 'inset 0 2px 8px rgba(120,124,170,0.1)',
              }}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {/* Grid overlay */}
              <div className="absolute inset-0" style={{
                backgroundImage: 'linear-gradient(rgba(120,124,170,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(120,124,170,0.06) 1px, transparent 1px)',
                backgroundSize: '10% 10%',
              }} />

              {/* Certificate header preview */}
              <div className="absolute top-0 left-0 right-0 text-center pt-2">
                <img src="/logo-rasmi.png" alt="Logo Rasmi ADTEC" className="h-8 mx-auto mb-1 object-contain" />
                <p className="text-[7px] font-bold tracking-wider" style={{ color: 'rgba(47,49,80,0.4)' }}>KOLEJ TEKNOLOGI TERMAJU (ADTEC)</p>
                <p className="text-[5px]" style={{ color: 'rgba(47,49,80,0.25)' }}>JABATAN TENAGA MANUSIA, KEMENTERIAN SUMBER MANUSIA</p>
                <div className="mx-auto mt-1" style={{ width: '60%', height: '1px', background: 'rgba(124,108,240,0.2)' }} />
                <p className="text-[9px] font-bold mt-2" style={{ color: 'rgba(47,49,80,0.35)' }}>SIJIL PENYERTAAN</p>
                <p className="text-[6px] italic" style={{ color: 'rgba(47,49,80,0.2)' }}>CERTIFICATE OF PARTICIPATION</p>
              </div>

              {/* Decorative border */}
              <div className="absolute inset-2 rounded-md" style={{ border: '1px solid rgba(124,108,240,0.15)' }} />

              {/* Field items */}
              {medan.map((m: any, index: number) => {
                const isSelected = selectedField === index
                const isDraggingThis = dragging === index
                const fieldDef = MEDAN_SENARAI.find(f => f.kunci === m.kunciMedan)
                const displayText = m.jenisElemen === 'qr' ? 'QR' : (fieldDef?.contoh || m.kunciMedan)
                const isBold = m.gayaFon === 'tebal' || m.gayaFon === 'tebal_condong'
                const isItalic = m.gayaFon === 'condong' || m.gayaFon === 'tebal_condong'

                return (
                  <div
                    key={index}
                    className="absolute select-none"
                    style={{
                      left: `${m.posXPeratus}%`,
                      top: `${m.posYPeratus}%`,
                      transform: 'translate(-50%, -50%)',
                      cursor: isDraggingThis ? 'grabbing' : 'grab',
                      zIndex: isDraggingThis ? 100 : isSelected ? 50 : 10,
                      transition: isDraggingThis ? 'none' : 'box-shadow 0.15s',
                    }}
                    onMouseDown={(e) => handleMouseDown(e, index)}
                    onClick={(e) => { e.stopPropagation(); setSelectedField(index) }}
                  >
                    <div
                      className="px-2 py-1 rounded-lg text-center whitespace-nowrap"
                      style={{
                        minWidth: m.jenisElemen === 'qr' ? '28px' : undefined,
                        fontSize: `${Math.max(6, Math.min(12, m.saizFon / 3))}px`,
                        fontFamily: m.keluargaFon,
                        fontWeight: isBold ? 700 : 400,
                        fontStyle: isItalic ? 'italic' : 'normal',
                        color: m.warnaFon,
                        background: isSelected
                          ? 'rgba(124,108,240,0.12)'
                          : m.jenisElemen === 'qr'
                            ? 'rgba(226,109,142,0.08)'
                            : 'rgba(255,255,255,0.7)',
                        border: isSelected
                          ? '2px solid var(--clay-primary)'
                          : '1px dashed rgba(120,124,170,0.3)',
                        boxShadow: isSelected ? '0 0 0 3px rgba(124,108,240,0.15)' : 'none',
                        width: `${m.lebarPeratus * 3}px`,
                      }}
                    >
                      {m.jenisElemen === 'qr' ? (
                        <div className="flex items-center justify-center" style={{ width: '24px', height: '24px', margin: '0 auto' }}>
                          <QrCode className="w-4 h-4" style={{ color: m.warnaFon }} />
                        </div>
                      ) : (
                        <span className="block truncate">{displayText}</span>
                      )}
                    </div>
                    {/* Field label */}
                    <p className="text-[5px] mt-0.5 text-center font-medium" style={{ color: isSelected ? 'var(--clay-primary)' : 'rgba(120,124,170,0.6)' }}>
                      {m.kunciMedan.replace(/_/g, ' ')}
                    </p>
                  </div>
                )
              })}

              {/* Signature preview on canvas */}
              <div className="absolute bottom-[18%] left-[8%] right-[52%] flex flex-col items-center">
                {tandatanganPengarah ? (
                  <img src={tandatanganPengarah} alt="Tandatangan Pengarah" className="h-6 object-contain opacity-60" />
                ) : (
                  <p className="text-[4px] italic" style={{ color: 'rgba(120,124,170,0.3)' }}>Tandatangan Pengarah</p>
                )}
                <div className="mt-0.5" style={{ width: '80%', height: '1px', background: 'rgba(120,124,170,0.15)' }} />
                {namaPenandatangan && <p className="text-[4px] mt-0.5 font-semibold" style={{ color: 'rgba(120,124,170,0.35)' }}>{namaPenandatangan}</p>}
                <p className="text-[4px] mt-0.5" style={{ color: 'rgba(120,124,170,0.3)' }}>{jawatanPenandatangan || 'Pengarah'}</p>
              </div>
              <div className="absolute bottom-[18%] left-[58%] right-[3%] flex flex-col items-center">
                {tandatanganPenyelaras ? (
                  <img src={tandatanganPenyelaras} alt="Cop Rasmi" className="h-8 object-contain opacity-70" />
                ) : (
                  <p className="text-[4px] italic" style={{ color: 'rgba(120,124,170,0.3)' }}>Cop Rasmi</p>
                )}
                <p className="text-[4px] mt-0.5" style={{ color: 'rgba(120,124,170,0.35)' }}>Cop Rasmi</p>
              </div>

              {/* Empty state */}
              {medan.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Move className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--clay-ink-soft)', opacity: 0.4 }} />
                    <p className="text-xs" style={{ color: 'var(--clay-ink-soft)' }}>Tambah medan dari panel sebelah kanan</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel: Field List + Properties */}
        <div className="w-full lg:w-80 space-y-4">
          {/* Add Fields */}
          <div className="clay-card p-4">
            <h4 className="text-sm font-semibold mb-3" style={{ color: 'var(--clay-ink)' }}>Tambah Medan</h4>
            <div className="space-y-1 max-h-48 overflow-y-auto clay-scroll">
              {MEDAN_SENARAI.filter(m => !medan.some((f: any) => f.kunciMedan === m.kunci)).map(m => (
                <button
                  key={m.kunci}
                  onClick={() => addField(m.kunci)}
                  className="w-full text-left px-3 py-1.5 rounded-xl text-xs flex items-center gap-2 transition-all hover:scale-[1.02]"
                  style={{
                    background: 'var(--clay-bg)',
                    color: 'var(--clay-ink-secondary)',
                    border: '1px dashed var(--border)',
                  }}
                >
                  <Plus className="w-3 h-3" style={{ color: 'var(--clay-primary)' }} />
                  <span className="font-medium">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tandatangan Digital Upload */}
          <div className="clay-card p-4">
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--clay-ink)' }}>
              <PenLine className="w-4 h-4" style={{ color: 'var(--clay-primary)' }} />
              Tandatangan Digital
            </h4>
            <p className="text-xs mb-3" style={{ color: 'var(--clay-ink-soft)' }}>Muat naik imej tandatangan (.png sahaja)</p>

            {/* Tandatangan Pengarah */}
            <div className="mb-3">
              <label className="text-xs font-medium flex items-center gap-1.5 mb-1.5" style={{ color: 'var(--clay-ink-secondary)' }}>
                <Award className="w-3 h-3" /> Pengarah
              </label>
              <input
                ref={pengarahInputRef}
                type="file"
                accept=".png"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  if (!file.type.startsWith('image/png')) {
                    toast({ title: 'Format Tidak Sah', description: 'Hanya fail .png sahaja dibenarkan.', variant: 'destructive' })
                    return
                  }
                  setUploadingSig('pengarah')
                  try {
                    const formData = new FormData()
                    formData.append('fail', file)
                    formData.append('jenis', 'pengarah')
                    const res = await fetch('/api/upload/tandatangan', { method: 'POST', body: formData })
                    const result = await res.json()
                    if (result.berjaya) {
                      setTandatanganPengarah(result.data.laluan)
                      toast({ title: 'Tandatangan Dimuat Naik', description: 'Tandatangan Pengarah berjaya dimuat naik.' })
                    } else {
                      toast({ title: 'Ralat', description: result.mesej || 'Gagal memuat naik.', variant: 'destructive' })
                    }
                  } catch {
                    toast({ title: 'Ralat', description: 'Gagal memuat naik tandatangan.', variant: 'destructive' })
                  }
                  setUploadingSig(null)
                  if (pengarahInputRef.current) pengarahInputRef.current.value = ''
                }}
              />
              {tandatanganPengarah ? (
                <div className="relative rounded-xl overflow-hidden" style={{ background: 'var(--clay-bg)', border: '1px solid var(--border)' }}>
                  <img src={tandatanganPengarah} alt="Tandatangan Pengarah" className="w-full h-16 object-contain p-2" />
                  <button
                    onClick={async () => {
                      try { await fetch(`/api/upload/tandatangan?laluan=${encodeURIComponent(tandatanganPengarah)}`, { method: 'DELETE' }) } catch {}
                      setTandatanganPengarah('')
                    }}
                    className="absolute top-1 right-1 p-1 rounded-lg transition-all"
                    style={{ background: 'rgba(226,109,142,0.15)', color: 'var(--clay-danger)' }}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => pengarahInputRef.current?.click()}
                  disabled={uploadingSig === 'pengarah'}
                  className="w-full py-3 rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition-all hover:scale-[1.01] disabled:opacity-50"
                  style={{
                    background: 'var(--clay-bg)',
                    border: '2px dashed var(--border)',
                    color: 'var(--clay-ink-soft)',
                  }}
                >
                  {uploadingSig === 'pengarah' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {uploadingSig === 'pengarah' ? 'Memuat naik...' : 'Muat Naik .png'}
                </button>
              )}
            </div>

            {/* Jawatan & Nama Penandatangan */}
            <div className="space-y-2 mt-1 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
              <label className="text-xs font-medium flex items-center gap-1.5" style={{ color: 'var(--clay-ink-secondary)' }}>
                <Edit2 className="w-3 h-3" /> Jawatan Penandatangan
              </label>
              <select
                value={jawatanMode === 'custom' ? '__custom__' : jawatanPenandatangan}
                onChange={(e) => {
                  if (e.target.value === '__custom__') {
                    setJawatanMode('custom')
                    setJawatanCustom(jawatanPenandatangan)
                  } else {
                    setJawatanMode('preset')
                    setJawatanPenandatangan(e.target.value)
                  }
                }}
                className="w-full text-xs rounded-xl px-3 py-2 outline-none transition-all"
                style={{
                  background: 'var(--clay-bg)',
                  border: '1px solid var(--border)',
                  color: 'var(--clay-ink)',
                }}
              >
                <option value="Pengarah">Pengarah</option>
                <option value="Timbalan Pengarah Latihan">Timbalan Pengarah Latihan</option>
                <option value="Timbalan Pengarah Operasi">Timbalan Pengarah Operasi</option>
                <option value="__custom__">Lain-lain...</option>
              </select>
              {jawatanMode === 'custom' && (
                <Input
                  value={jawatanCustom}
                  placeholder="Taip jawatan penandatangan..."
                  onChange={(e) => {
                    setJawatanCustom(e.target.value)
                    setJawatanPenandatangan(e.target.value)
                  }}
                  className="text-xs rounded-xl"
                  style={{ background: 'var(--clay-bg)', border: '1px solid var(--border)', color: 'var(--clay-ink)' }}
                />
              )}
              <label className="text-xs font-medium flex items-center gap-1.5 mt-2" style={{ color: 'var(--clay-ink-secondary)' }}>
                <Award className="w-3 h-3" /> Nama Penandatangan
              </label>
              <Input
                value={namaPenandatangan}
                placeholder="Cth: Hj. Ahmad bin Abdullah"
                onChange={(e) => setNamaPenandatangan(e.target.value)}
                className="text-xs rounded-xl"
                style={{ background: 'var(--clay-bg)', border: '1px solid var(--border)', color: 'var(--clay-ink)' }}
              />
            </div>

            {/* Tandatangan Penyelaras */}
            <div>
              <label className="text-xs font-medium flex items-center gap-1.5 mb-1.5" style={{ color: 'var(--clay-ink-secondary)' }}>
                <Users className="w-3 h-3" /> Penyelaras
              </label>
              <input
                ref={penyelarasInputRef}
                type="file"
                accept=".png"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  if (!file.type.startsWith('image/png')) {
                    toast({ title: 'Format Tidak Sah', description: 'Hanya fail .png sahaja dibenarkan.', variant: 'destructive' })
                    return
                  }
                  setUploadingSig('penyelaras')
                  try {
                    const formData = new FormData()
                    formData.append('fail', file)
                    formData.append('jenis', 'penyelaras')
                    const res = await fetch('/api/upload/tandatangan', { method: 'POST', body: formData })
                    const result = await res.json()
                    if (result.berjaya) {
                      setTandatanganPenyelaras(result.data.laluan)
                      toast({ title: 'Tandatangan Dimuat Naik', description: 'Tandatangan Penyelaras berjaya dimuat naik.' })
                    } else {
                      toast({ title: 'Ralat', description: result.mesej || 'Gagal memuat naik.', variant: 'destructive' })
                    }
                  } catch {
                    toast({ title: 'Ralat', description: 'Gagal memuat naik tandatangan.', variant: 'destructive' })
                  }
                  setUploadingSig(null)
                  if (penyelarasInputRef.current) penyelarasInputRef.current.value = ''
                }}
              />
              {tandatanganPenyelaras ? (
                <div className="relative rounded-xl overflow-hidden" style={{ background: 'var(--clay-bg)', border: '1px solid var(--border)' }}>
                  <img src={tandatanganPenyelaras} alt="Tandatangan Penyelaras" className="w-full h-16 object-contain p-2" />
                  <button
                    onClick={async () => {
                      try { await fetch(`/api/upload/tandatangan?laluan=${encodeURIComponent(tandatanganPenyelaras)}`, { method: 'DELETE' }) } catch {}
                      setTandatanganPenyelaras('')
                    }}
                    className="absolute top-1 right-1 p-1 rounded-lg transition-all"
                    style={{ background: 'rgba(226,109,142,0.15)', color: 'var(--clay-danger)' }}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => penyelarasInputRef.current?.click()}
                  disabled={uploadingSig === 'penyelaras'}
                  className="w-full py-3 rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition-all hover:scale-[1.01] disabled:opacity-50"
                  style={{
                    background: 'var(--clay-bg)',
                    border: '2px dashed var(--border)',
                    color: 'var(--clay-ink-soft)',
                  }}
                >
                  {uploadingSig === 'penyelaras' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {uploadingSig === 'penyelaras' ? 'Memuat naik...' : 'Muat Naik .png'}
                </button>
              )}
            </div>
          </div>

          {/* Current Fields List */}
          <div className="clay-card p-4">
            <h4 className="text-sm font-semibold mb-3" style={{ color: 'var(--clay-ink)' }}>
              Medan Templat ({medan.length})
            </h4>
            <div className="space-y-1 max-h-60 overflow-y-auto clay-scroll">
              {medan.map((m: any, index: number) => {
                const fieldDef = MEDAN_SENARAI.find(f => f.kunci === m.kunciMedan)
                const isSelected = selectedField === index
                return (
                  <div
                    key={index}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded-xl text-xs cursor-pointer transition-all ${isSelected ? '' : ''}`}
                    style={{
                      background: isSelected ? 'rgba(124,108,240,0.1)' : 'transparent',
                      border: isSelected ? '1px solid rgba(124,108,240,0.3)' : '1px solid transparent',
                      color: isSelected ? 'var(--clay-primary-dark)' : 'var(--clay-ink-secondary)',
                    }}
                    onClick={() => setSelectedField(index)}
                  >
                    <GripVertical className="w-3 h-3 opacity-40" />
                    <span className="flex-1 font-medium truncate">{fieldDef?.label || m.kunciMedan}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); removeField(index) }}
                      className="p-0.5 rounded hover:bg-red-50 transition-colors"
                      style={{ color: 'var(--clay-danger)' }}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )
              })}
              {medan.length === 0 && (
                <p className="text-xs text-center py-2" style={{ color: 'var(--clay-ink-soft)' }}>Tiada medan lagi</p>
              )}
            </div>
          </div>

          {/* Field Properties Editor */}
          {selectedFieldData && (
            <div className="clay-card p-4">
              <h4 className="text-sm font-semibold mb-3" style={{ color: 'var(--clay-ink)' }}>Sifat Medan</h4>
              <div className="space-y-3">
                {/* Field name */}
                <div>
                  <label className="text-xs font-medium" style={{ color: 'var(--clay-ink-soft)' }}>Medan</label>
                  <p className="text-sm font-semibold" style={{ color: 'var(--clay-ink)' }}>
                    {MEDAN_SENARAI.find(f => f.kunci === selectedFieldData.kunciMedan)?.label || selectedFieldData.kunciMedan}
                  </p>
                </div>

                {/* Position */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-medium" style={{ color: 'var(--clay-ink-soft)' }}>X (%)</label>
                    <input
                      type="number" min={0} max={100} step={0.5}
                      value={Math.round(selectedFieldData.posXPeratus * 10) / 10}
                      onChange={(e) => updateField(selectedField!, 'posXPeratus', parseFloat(e.target.value) || 0)}
                      className="w-full mt-1 px-2 py-1 rounded-lg text-xs"
                      style={{
                        background: 'var(--clay-bg)',
                        border: '1px solid var(--border)',
                        color: 'var(--clay-ink)',
                        boxShadow: 'var(--clay-inset)',
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium" style={{ color: 'var(--clay-ink-soft)' }}>Y (%)</label>
                    <input
                      type="number" min={0} max={100} step={0.5}
                      value={Math.round(selectedFieldData.posYPeratus * 10) / 10}
                      onChange={(e) => updateField(selectedField!, 'posYPeratus', parseFloat(e.target.value) || 0)}
                      className="w-full mt-1 px-2 py-1 rounded-lg text-xs"
                      style={{
                        background: 'var(--clay-bg)',
                        border: '1px solid var(--border)',
                        color: 'var(--clay-ink)',
                        boxShadow: 'var(--clay-inset)',
                      }}
                    />
                  </div>
                </div>

                {/* Width */}
                <div>
                  <label className="text-xs font-medium" style={{ color: 'var(--clay-ink-soft)' }}>Lebar (%)</label>
                  <input
                    type="range" min={5} max={90} step={1}
                    value={selectedFieldData.lebarPeratus}
                    onChange={(e) => updateField(selectedField!, 'lebarPeratus', parseFloat(e.target.value))}
                    className="w-full mt-1 accent-[#7C6CF0]"
                  />
                  <span className="text-xs" style={{ color: 'var(--clay-ink-soft)' }}>{selectedFieldData.lebarPeratus}%</span>
                </div>

                {/* Font family */}
                {selectedFieldData.jenisElemen !== 'qr' && (
                  <>
                    <div>
                      <label className="text-xs font-medium" style={{ color: 'var(--clay-ink-soft)' }}>Fon</label>
                      <select
                        value={selectedFieldData.keluargaFon}
                        onChange={(e) => updateField(selectedField!, 'keluargaFon', e.target.value)}
                        className="w-full mt-1 px-2 py-1 rounded-lg text-xs"
                        style={{
                          background: 'var(--clay-bg)',
                          border: '1px solid var(--border)',
                          color: 'var(--clay-ink)',
                          boxShadow: 'var(--clay-inset)',
                        }}
                      >
                        {FON_SENARAI.map(f => <option key={f} value={f}>{f}</option>)}
                      </select>
                    </div>

                    {/* Font size */}
                    <div>
                      <label className="text-xs font-medium" style={{ color: 'var(--clay-ink-soft)' }}>Saiz Fon (pt)</label>
                      <input
                        type="number" min={8} max={72} step={1}
                        value={selectedFieldData.saizFon}
                        onChange={(e) => updateField(selectedField!, 'saizFon', parseFloat(e.target.value) || 12)}
                        className="w-full mt-1 px-2 py-1 rounded-lg text-xs"
                        style={{
                          background: 'var(--clay-bg)',
                          border: '1px solid var(--border)',
                          color: 'var(--clay-ink)',
                          boxShadow: 'var(--clay-inset)',
                        }}
                      />
                    </div>

                    {/* Font color */}
                    <div>
                      <label className="text-xs font-medium" style={{ color: 'var(--clay-ink-soft)' }}>Warna Fon</label>
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="color"
                          value={selectedFieldData.warnaFon}
                          onChange={(e) => updateField(selectedField!, 'warnaFon', e.target.value)}
                          className="w-8 h-8 rounded-lg cursor-pointer"
                          style={{ border: '1px solid var(--border)' }}
                        />
                        <input
                          type="text"
                          value={selectedFieldData.warnaFon}
                          onChange={(e) => updateField(selectedField!, 'warnaFon', e.target.value)}
                          className="flex-1 px-2 py-1 rounded-lg text-xs"
                          style={{
                            background: 'var(--clay-bg)',
                            border: '1px solid var(--border)',
                            color: 'var(--clay-ink)',
                            fontFamily: 'monospace',
                          }}
                        />
                      </div>
                    </div>

                    {/* Font style */}
                    <div>
                      <label className="text-xs font-medium" style={{ color: 'var(--clay-ink-soft)' }}>Gaya Fon</label>
                      <div className="flex gap-1 mt-1">
                        {GAYA_FON_SENARAI.map(g => (
                          <button
                            key={g.nilai}
                            onClick={() => updateField(selectedField!, 'gayaFon', g.nilai)}
                            className="px-2 py-1 rounded-lg text-xs font-medium transition-all"
                            style={{
                              background: selectedFieldData.gayaFon === g.nilai ? 'var(--clay-primary)' : 'var(--clay-bg)',
                              color: selectedFieldData.gayaFon === g.nilai ? 'white' : 'var(--clay-ink-secondary)',
                              border: `1px solid ${selectedFieldData.gayaFon === g.nilai ? 'var(--clay-primary)' : 'var(--border)'}`,
                            }}
                          >
                            {g.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Alignment */}
                    <div>
                      <label className="text-xs font-medium" style={{ color: 'var(--clay-ink-soft)' }}>Penjajaran</label>
                      <div className="flex gap-1 mt-1">
                        {PENJAJARAN_SENARAI.map(p => (
                          <button
                            key={p.nilai}
                            onClick={() => updateField(selectedField!, 'penjajaran', p.nilai)}
                            className="p-1.5 rounded-lg transition-all"
                            style={{
                              background: selectedFieldData.penjajaran === p.nilai ? 'var(--clay-primary)' : 'var(--clay-bg)',
                              color: selectedFieldData.penjajaran === p.nilai ? 'white' : 'var(--clay-ink-secondary)',
                              border: `1px solid ${selectedFieldData.penjajaran === p.nilai ? 'var(--clay-primary)' : 'var(--border)'}`,
                            }}
                          >
                            <p.icon className="w-3.5 h-3.5" />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Auto-shrink */}
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium" style={{ color: 'var(--clay-ink-soft)' }}>Auto-Kecil</label>
                      <Switch
                        checked={selectedFieldData.autoKecil}
                        onCheckedChange={(v) => updateField(selectedField!, 'autoKecil', v)}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
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
  const [pesertaList, setPesertaList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const { toast } = useToast()

  const loadData = (kursusId: string) => {
    setLoading(true)
    // Fetch both certificates and participants for this course
    Promise.all([
      fetch(`/api/sijil?kursusId=${kursusId}`).then(r => r.json()),
      fetch(`/api/peserta?kursusId=${kursusId}`).then(r => r.json()),
    ]).then(([sijilData, pesertaData]) => {
      if (sijilData.berjaya) setSijilList(sijilData.data)
      if (pesertaData.berjaya) setPesertaList(pesertaData.data)
    }).finally(() => setLoading(false))
  }

  useEffect(() => {
    fetch('/api/kursus').then(r => r.json()).then(d => {
      if (d.berjaya) {
        setKursusList(d.data)
        if (d.data.length > 0) {
          const firstId = d.data[0].id
          setSelectedKursus(firstId)
          loadData(firstId)
        } else {
          setLoading(false)
        }
      }
    })
  }, [])

  const handleKursusChange = (id: string) => {
    setSelectedKursus(id)
    loadData(id)
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
        loadData(selectedKursus)
      } else {
        toast({ title: 'Ralat', description: data.mesej || 'Gagal menjana sijil.', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Ralat', description: 'Gagal menjana sijil.', variant: 'destructive' })
    } finally {
      setGenerating(false)
    }
  }

  // Combine participants with their certificate status
  const pesertaWithSijil = pesertaList.map((p: any) => {
    const existingSijil = sijilList.find((s: any) => s.pesertaId === p.id)
    return {
      ...p,
      sijil: existingSijil || null,
      hasSijil: !!existingSijil,
    }
  })

  const eligibleCount = pesertaWithSijil.filter((p: any) => p.statusKelayakan === 'layak' && !p.hasSijil).length
  const generatedCount = pesertaWithSijil.filter((p: any) => p.hasSijil).length

  const handleDownloadSijil = async (sijilId: string) => {
    try {
      const res = await fetch('/api/awam/jana-sijil', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sijilId }),
      })
      if (res.ok) {
        const blob = await res.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'sijil.pdf'
        a.click()
        window.URL.revokeObjectURL(url)
        loadData(selectedKursus)
      }
    } catch {
      toast({ title: 'Ralat', description: 'Gagal memuat turun sijil.', variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-4">
      <div className="clay-card p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <h3 className="font-semibold" style={{ color: 'var(--clay-ink)' }}>Senarai Peserta &amp; Sijil</h3>
          <select value={selectedKursus} onChange={(e) => handleKursusChange(e.target.value)}
            className="clay-input px-4 py-2 text-sm flex-1 sm:max-w-sm"
            style={{ background: 'var(--clay)', color: 'var(--clay-ink)' }}>
            {kursusList.map((k: any) => <option key={k.id} value={k.id}>{k.namaKursusBm}</option>)}
          </select>
          <button onClick={handleBulkGenerate} disabled={generating || eligibleCount === 0}
            className="clay-btn text-sm flex items-center gap-2"
            style={{ borderRadius: '16px', opacity: eligibleCount === 0 ? 0.5 : 1 }}>
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Jana Semua Sijil ({eligibleCount} layak)
          </button>
        </div>
        {pesertaWithSijil.length > 0 && (
          <div className="flex gap-4 mt-3 text-xs" style={{ color: 'var(--clay-ink-secondary)' }}>
            <span>Jumlah peserta: <strong>{pesertaWithSijil.length}</strong></span>
            <span>Sijil dijana: <strong style={{ color: 'var(--clay-success)' }}>{generatedCount}</strong></span>
            <span>Menunggu: <strong style={{ color: 'var(--clay-primary)' }}>{eligibleCount}</strong></span>
          </div>
        )}
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
                  <th className="px-3 py-3 text-center">Kelayakan</th>
                  <th className="px-3 py-3 text-center">Status Sijil</th>
                  <th className="px-3 py-3 text-center rounded-tr-xl">Tindakan</th>
                </tr>
              </thead>
              <tbody>
                {pesertaWithSijil.map((p: any, i: number) => (
                  <tr key={p.id} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(124,108,240,0.04)' }}>
                    <td className="px-3 py-3 font-mono text-xs" style={{ color: p.hasSijil ? 'var(--clay-primary)' : 'var(--clay-ink-soft)' }}>
                      {p.hasSijil ? p.sijil.noSiri : '—'}
                    </td>
                    <td className="px-3 py-3" style={{ color: 'var(--clay-ink)' }}>{p.namaPenuh}</td>
                    <td className="px-3 py-3 font-mono text-xs" style={{ color: 'var(--clay-ink-secondary)' }}>
                      {p.noMykad ? `${p.noMykad.slice(0,6)}-${p.noMykad.slice(6,8)}-${p.noMykad.slice(8)}` : '-'}
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold"
                        style={{ background: p.statusKelayakan === 'layak' ? 'var(--clay-success-bg)' : 'var(--clay-danger-bg)', color: p.statusKelayakan === 'layak' ? 'var(--clay-success)' : 'var(--clay-danger)' }}>
                        {p.statusKelayakan === 'layak' ? 'Layak' : 'Tidak Layak'}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-center">
                      {p.hasSijil ? (
                        <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold"
                          style={{ background: p.sijil.status === 'sah' ? 'var(--clay-success-bg)' : 'var(--clay-danger-bg)', color: p.sijil.status === 'sah' ? 'var(--clay-success)' : 'var(--clay-danger)' }}>
                          {p.sijil.status === 'sah' ? 'Sah' : 'Dibatalkan'}
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold"
                          style={{ background: 'rgba(124,108,240,0.1)', color: 'var(--clay-primary)' }}>
                          Belum Dijana
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-center">
                      {p.hasSijil && p.sijil.status === 'sah' ? (
                        <button onClick={() => handleDownloadSijil(p.sijil.id)}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-colors hover:opacity-80"
                          style={{ background: 'var(--clay-primary)', color: 'white' }}>
                          <Download className="w-3 h-3" /> PDF
                        </button>
                      ) : (
                        <span style={{ color: 'var(--clay-ink-soft)' }} className="text-xs">—</span>
                      )}
                    </td>
                  </tr>
                ))}
                {pesertaWithSijil.length === 0 && (
                  <tr><td colSpan={6} className="px-3 py-8 text-center" style={{ color: 'var(--clay-ink-soft)' }}>
                    Tiada peserta didaftarkan untuk kursus ini. Sila tambah peserta terlebih dahulu.
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
