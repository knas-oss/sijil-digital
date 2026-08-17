-- e-Sijil ADTEC Sandakan - Supabase Migration Script
-- Run this in Supabase SQL Editor (https://supabase.com/dashboard/project/cotqldnfuoixzdvbqoln/sql)

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable: pengguna
CREATE TABLE "pengguna" (
    "id" TEXT NOT NULL,
    "namaPenuh" TEXT NOT NULL,
    "emel" TEXT NOT NULL,
    "kataLaluanHash" TEXT NOT NULL,
    "peranan" TEXT NOT NULL DEFAULT 'penyelaras',
    "noTelefon" TEXT,
    "status" TEXT NOT NULL DEFAULT 'aktif',
    "percubaanGagal" INTEGER NOT NULL DEFAULT 0,
    "logMasukTerakhir" TIMESTAMP(3),
    "diciptaPada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dikemaskiniPada" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pengguna_pkey" PRIMARY KEY ("id")
);

-- CreateTable: kategori_program
CREATE TABLE "kategori_program" (
    "id" TEXT NOT NULL,
    "kodKategori" TEXT NOT NULL,
    "namaKategori" TEXT NOT NULL,
    "keterangan" TEXT,
    "warnaLabel" TEXT NOT NULL DEFAULT '#7C6CF0',
    "status" TEXT NOT NULL DEFAULT 'aktif',
    "diciptaPada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dikemaskiniPada" TIMESTAMP(3) NOT NULL,
    "templatLalaiId" TEXT,

    CONSTRAINT "kategori_program_pkey" PRIMARY KEY ("id")
);

-- CreateTable: kursus
CREATE TABLE "kursus" (
    "id" TEXT NOT NULL,
    "kodKursus" TEXT NOT NULL,
    "namaKursusBm" TEXT NOT NULL,
    "namaKursusBi" TEXT,
    "tempohJam" INTEGER,
    "namaPenyelaras" TEXT,
    "tempat" TEXT DEFAULT 'ADTEC JTM Kampus Sandakan',
    "penganjurBersama" TEXT,
    "catatan" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draf',
    "tarikhMula" TIMESTAMP(3) NOT NULL,
    "tarikhTamat" TIMESTAMP(3) NOT NULL,
    "diciptaPada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dikemaskiniPada" TIMESTAMP(3) NOT NULL,
    "kategoriId" TEXT NOT NULL,
    "templatKhususId" TEXT,
    "diciptaOlehId" TEXT NOT NULL,

    CONSTRAINT "kursus_pkey" PRIMARY KEY ("id")
);

-- CreateTable: peserta
CREATE TABLE "peserta" (
    "id" TEXT NOT NULL,
    "namaPenuh" TEXT NOT NULL,
    "noMykad" TEXT NOT NULL,
    "noMykadHash" TEXT NOT NULL,
    "jenisPengecam" TEXT NOT NULL DEFAULT 'mykad',
    "noTelefon" TEXT,
    "emel" TEXT,
    "jantina" TEXT,
    "statusKelayakan" TEXT NOT NULL DEFAULT 'layak',
    "catatan" TEXT,
    "diciptaPada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dikemaskiniPada" TIMESTAMP(3) NOT NULL,
    "kursusId" TEXT NOT NULL,

    CONSTRAINT "peserta_pkey" PRIMARY KEY ("id")
);

-- CreateTable: pendaftaran_awam
CREATE TABLE "pendaftaran_awam" (
    "id" TEXT NOT NULL,
    "namaPenuh" TEXT NOT NULL,
    "noMykad" TEXT NOT NULL,
    "noMykadHash" TEXT NOT NULL,
    "noTelefon" TEXT,
    "emel" TEXT,
    "jantina" TEXT,
    "status" TEXT NOT NULL DEFAULT 'menunggu',
    "catatan" TEXT,
    "diciptaPada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dikemaskiniPada" TIMESTAMP(3) NOT NULL,
    "kursusId" TEXT NOT NULL,

    CONSTRAINT "pendaftaran_awam_pkey" PRIMARY KEY ("id")
);

-- CreateTable: templat_sijil
CREATE TABLE "templat_sijil" (
    "id" TEXT NOT NULL,
    "namaTemplat" TEXT NOT NULL,
    "keterangan" TEXT,
    "laluanFail" TEXT NOT NULL,
    "jenisFail" TEXT NOT NULL DEFAULT 'png',
    "orientasi" TEXT NOT NULL DEFAULT 'landskap',
    "saizKertas" TEXT NOT NULL DEFAULT 'a4',
    "lebarPx" INTEGER NOT NULL DEFAULT 3508,
    "tinggiPx" INTEGER NOT NULL DEFAULT 2480,
    "versi" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'draf',
    "laluanTandatanganPengarah" TEXT,
    "laluanTandatanganPenyelaras" TEXT,
    "jawatanPenandatangan" TEXT,
    "namaPenandatangan" TEXT,
    "diciptaPada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dikemaskiniPada" TIMESTAMP(3) NOT NULL,
    "dimuatNaikOlehId" TEXT NOT NULL,

    CONSTRAINT "templat_sijil_pkey" PRIMARY KEY ("id")
);

-- CreateTable: medan_templat
CREATE TABLE "medan_templat" (
    "id" TEXT NOT NULL,
    "kunciMedan" TEXT NOT NULL,
    "jenisElemen" TEXT NOT NULL DEFAULT 'teks',
    "posXPeratus" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "posYPeratus" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "lebarPeratus" DOUBLE PRECISION NOT NULL DEFAULT 40,
    "keluargaFon" TEXT NOT NULL DEFAULT 'Times New Roman',
    "saizFon" DOUBLE PRECISION NOT NULL DEFAULT 24,
    "warnaFon" TEXT NOT NULL DEFAULT '#000000',
    "gayaFon" TEXT NOT NULL DEFAULT 'normal',
    "penjajaran" TEXT NOT NULL DEFAULT 'tengah',
    "autoKecil" BOOLEAN NOT NULL DEFAULT true,
    "templatId" TEXT NOT NULL,

    CONSTRAINT "medan_templat_pkey" PRIMARY KEY ("id")
);

-- CreateTable: sijil
CREATE TABLE "sijil" (
    "id" TEXT NOT NULL,
    "noSiri" TEXT NOT NULL,
    "kodQr" TEXT,
    "laluanPdf" TEXT,
    "status" TEXT NOT NULL DEFAULT 'sah',
    "sebabBatal" TEXT,
    "bilMuatTurun" INTEGER NOT NULL DEFAULT 0,
    "dijanaPada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "muatTurunTerakhir" TIMESTAMP(3),
    "versiTemplat" INTEGER NOT NULL DEFAULT 1,
    "pesertaId" TEXT NOT NULL,
    "kursusId" TEXT NOT NULL,
    "templatId" TEXT NOT NULL,

    CONSTRAINT "sijil_pkey" PRIMARY KEY ("id")
);

-- CreateTable: log_audit
CREATE TABLE "log_audit" (
    "id" TEXT NOT NULL,
    "tindakan" TEXT NOT NULL,
    "entiti" TEXT NOT NULL,
    "idEntiti" TEXT,
    "butiran" TEXT,
    "alamatIp" TEXT,
    "agenPengguna" TEXT,
    "diciptaPada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "penggunaId" TEXT,

    CONSTRAINT "log_audit_pkey" PRIMARY KEY ("id")
);

-- CreateTable: tetapan_sistem
CREATE TABLE "tetapan_sistem" (
    "id" TEXT NOT NULL,
    "namaInstitusi" TEXT NOT NULL DEFAULT 'ADTEC JTM Kampus Sandakan',
    "alamatInstitusi" TEXT DEFAULT 'Jabatan Tenaga Manusia, Kementerian Sumber Manusia',
    "emelHubungan" TEXT DEFAULT 'adtec.sandakan@jtm.gov.my',
    "telefonHubungan" TEXT,
    "namaPengarah" TEXT DEFAULT 'Pengarah ADTEC Sandakan',
    "laluanTandatangan" TEXT,
    "laluanLogo" TEXT DEFAULT '/logo-adtec.png',
    "teksPengaki" TEXT DEFAULT 'Sijil ini dikeluarkan oleh ADTEC JTM Kampus Sandakan',
    "pengesahanKedua" BOOLEAN NOT NULL DEFAULT false,
    "captchaAktif" BOOLEAN NOT NULL DEFAULT false,
    "modPenyelenggaraan" BOOLEAN NOT NULL DEFAULT false,
    "dikemaskiniPada" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tetapan_sistem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pengguna_emel_key" ON "pengguna"("emel");
CREATE UNIQUE INDEX "kategori_program_kodKategori_key" ON "kategori_program"("kodKategori");
CREATE UNIQUE INDEX "kursus_kodKursus_key" ON "kursus"("kodKursus");
CREATE UNIQUE INDEX "peserta_kursusId_noMykadHash_key" ON "peserta"("kursusId", "noMykadHash");
CREATE UNIQUE INDEX "pendaftaran_awam_kursusId_noMykadHash_key" ON "pendaftaran_awam"("kursusId", "noMykadHash");
CREATE UNIQUE INDEX "sijil_noSiri_key" ON "sijil"("noSiri");

-- AddForeignKey
ALTER TABLE "kategori_program" ADD CONSTRAINT "kategori_program_templatLalaiId_fkey" FOREIGN KEY ("templatLalaiId") REFERENCES "templat_sijil"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "kursus" ADD CONSTRAINT "kursus_kategoriId_fkey" FOREIGN KEY ("kategoriId") REFERENCES "kategori_program"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "kursus" ADD CONSTRAINT "kursus_templatKhususId_fkey" FOREIGN KEY ("templatKhususId") REFERENCES "templat_sijil"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "kursus" ADD CONSTRAINT "kursus_diciptaOlehId_fkey" FOREIGN KEY ("diciptaOlehId") REFERENCES "pengguna"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "peserta" ADD CONSTRAINT "peserta_kursusId_fkey" FOREIGN KEY ("kursusId") REFERENCES "kursus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "pendaftaran_awam" ADD CONSTRAINT "pendaftaran_awam_kursusId_fkey" FOREIGN KEY ("kursusId") REFERENCES "kursus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "templat_sijil" ADD CONSTRAINT "templat_sijil_dimuatNaikOlehId_fkey" FOREIGN KEY ("dimuatNaikOlehId") REFERENCES "pengguna"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "medan_templat" ADD CONSTRAINT "medan_templat_templatId_fkey" FOREIGN KEY ("templatId") REFERENCES "templat_sijil"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "sijil" ADD CONSTRAINT "sijil_pesertaId_fkey" FOREIGN KEY ("pesertaId") REFERENCES "peserta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "sijil" ADD CONSTRAINT "sijil_kursusId_fkey" FOREIGN KEY ("kursusId") REFERENCES "kursus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "sijil" ADD CONSTRAINT "sijil_templatId_fkey" FOREIGN KEY ("templatId") REFERENCES "templat_sijil"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "log_audit" ADD CONSTRAINT "log_audit_penggunaId_fkey" FOREIGN KEY ("penggunaId") REFERENCES "pengguna"("id") ON DELETE SET NULL ON UPDATE CASCADE;
