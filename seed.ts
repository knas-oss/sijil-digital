// Seed script for e-Sijil ADTEC Sandakan
import { db } from './src/lib/db'
import { hash, compare } from 'bcrypt'

async function main() {
  console.log('🌱 Seeding database...')

  // 1. Create admin user
  const bcrypt = await import('bcrypt')
  const hashedPassword = await bcrypt.hash('Admin@2026', 12)
  
  const superAdmin = await db.pengguna.create({
    data: {
      namaPenuh: 'ADMIN SISTEM',
      emel: 'admin@adtec.gov.my',
      kataLaluanHash: hashedPassword,
      peranan: 'super_admin',
      noTelefon: '089-222444',
      status: 'aktif',
    }
  })

  const admin = await db.pengguna.create({
    data: {
      namaPenuh: 'HAJI MOHAMED',
      emel: 'hafiz@adtec.gov.my',
      kataLaluanHash: hashedPassword,
      peranan: 'admin',
      noTelefon: '089-222445',
      status: 'aktif',
    }
  })

  const penyelaras = await db.pengguna.create({
    data: {
      namaPenuh: 'NORLIZA BINTI AHMAD',
      emel: 'norliza@adtec.gov.my',
      kataLaluanHash: hashedPassword,
      peranan: 'penyelaras',
      noTelefon: '089-222446',
      status: 'aktif',
    }
  })

  console.log('✅ Users created')

  // 2. Create program categories
  const kp = await db.kategoriProgram.create({
    data: { kodKategori: 'KP', namaKategori: 'Kursus Pendek', keterangan: 'Kursus jangka pendek kemahiran teknikal', warnaLabel: '#7C6CF0', status: 'aktif' }
  })
  const pi = await db.kategoriProgram.create({
    data: { kodKategori: 'PI', namaKategori: 'Program Industri', keterangan: 'Program latihan bersama industri', warnaLabel: '#4FC4A1', status: 'aktif' }
  })
  const bk = await db.kategoriProgram.create({
    data: { kodKategori: 'BK', namaKategori: 'Bengkel Kemahiran', keterangan: 'Bengkel kemahiran jangka pendek', warnaLabel: '#E8A33D', status: 'aktif' }
  })
  const lds = await db.kategoriProgram.create({
    data: { kodKategori: 'LDS', namaKategori: 'Latihan Dalaman Staf', keterangan: 'Program latihan untuk staf dalaman', warnaLabel: '#E26D8E', status: 'aktif' }
  })
  const pk = await db.kategoriProgram.create({
    data: { kodKategori: 'PK', namaKategori: 'Program Kerjasama', keterangan: 'Program kerjasama dengan agensi luar', warnaLabel: '#5B4BD6', status: 'aktif' }
  })
  const lip = await db.kategoriProgram.create({
    data: { kodKategori: 'LIP', namaKategori: 'Latihan Industri Pelajar', keterangan: 'Latihan industri untuk pelajar', warnaLabel: '#9B8EF5', status: 'aktif' }
  })

  console.log('✅ Categories created')

  // 3. Create default template
  const templat = await db.templatSijil.create({
    data: {
      namaTemplat: 'Templat Sijil ADTEC Sandakan (Landskap)',
      keterangan: 'Templat rasmi sijil ADTEC JTM Kampus Sandakan - Landskap A4',
      laluanFail: '/templates/sijil-default.png',
      jenisFail: 'png',
      orientasi: 'landskap',
      saizKertas: 'a4',
      lebarPx: 3508,
      tinggiPx: 2480,
      versi: 1,
      status: 'aktif',
      dimuatNaikOlehId: superAdmin.id,
    }
  })

  // Add default field mappings
  const fields = [
    { kunciMedan: 'nama_penuh', jenisElemen: 'teks', posXPeratus: 50, posYPeratus: 42, lebarPeratus: 60, keluargaFon: 'Times New Roman', saizFon: 36, warnaFon: '#1a1a2e', gayaFon: 'tebal', penjajaran: 'tengah' },
    { kunciMedan: 'no_mykad', jenisElemen: 'teks', posXPeratus: 50, posYPeratus: 48, lebarPeratus: 30, keluargaFon: 'Times New Roman', saizFon: 18, warnaFon: '#333333', gayaFon: 'normal', penjajaran: 'tengah' },
    { kunciMedan: 'nama_kursus', jenisElemen: 'teks', posXPeratus: 50, posYPeratus: 58, lebarPeratus: 60, keluargaFon: 'Times New Roman', saizFon: 24, warnaFon: '#1a1a2e', gayaFon: 'tebal', penjajaran: 'tengah' },
    { kunciMedan: 'nama_kursus_bi', jenisElemen: 'teks', posXPeratus: 50, posYPeratus: 63, lebarPeratus: 60, keluargaFon: 'Times New Roman', saizFon: 18, warnaFon: '#333333', gayaFon: 'condong', penjajaran: 'tengah' },
    { kunciMedan: 'julat_tarikh', jenisElemen: 'teks', posXPeratus: 50, posYPeratus: 68, lebarPeratus: 40, keluargaFon: 'Times New Roman', saizFon: 18, warnaFon: '#333333', gayaFon: 'normal', penjajaran: 'tengah' },
    { kunciMedan: 'tempoh_jam', jenisElemen: 'teks', posXPeratus: 50, posYPeratus: 73, lebarPeratus: 20, keluargaFon: 'Times New Roman', saizFon: 18, warnaFon: '#333333', gayaFon: 'normal', penjajaran: 'tengah' },
    { kunciMedan: 'no_siri', jenisElemen: 'teks', posXPeratus: 50, posYPeratus: 88, lebarPeratus: 40, keluargaFon: 'Arial', saizFon: 12, warnaFon: '#666666', gayaFon: 'normal', penjajaran: 'tengah' },
    { kunciMedan: 'qr_pengesahan', jenisElemen: 'qr', posXPeratus: 90, posYPeratus: 88, lebarPeratus: 10, keluargaFon: 'Arial', saizFon: 12, warnaFon: '#000000', gayaFon: 'normal', penjajaran: 'tengah' },
    { kunciMedan: 'kategori_program', jenisElemen: 'teks', posXPeratus: 50, posYPeratus: 53, lebarPeratus: 30, keluargaFon: 'Times New Roman', saizFon: 16, warnaFon: '#555555', gayaFon: 'normal', penjajaran: 'tengah' },
  ]

  for (const field of fields) {
    await db.medanTemplat.create({
      data: { ...field, templatId: templat.id }
    })
  }

  // Link template to categories
  await db.kategoriProgram.update({ where: { id: kp.id }, data: { templatLalaiId: templat.id } })
  await db.kategoriProgram.update({ where: { id: pi.id }, data: { templatLalaiId: templat.id } })
  await db.kategoriProgram.update({ where: { id: bk.id }, data: { templatLalaiId: templat.id } })
  await db.kategoriProgram.update({ where: { id: lds.id }, data: { templatLalaiId: templat.id } })
  await db.kategoriProgram.update({ where: { id: pk.id }, data: { templatLalaiId: templat.id } })
  await db.kategoriProgram.update({ where: { id: lip.id }, data: { templatLalaiId: templat.id } })

  console.log('✅ Template and fields created')

  // 4. Create sample courses
  const courses = [
    { kodKursus: 'ADTEC-SDK/KP/2026/001', namaKursusBm: 'Pendawaian Elektrik Domestik', namaKursusBi: 'Domestic Electrical Wiring', tempohJam: 40, namaPenyelaras: 'NORLIZA BINTI AHMAD', kategoriId: kp.id, tarikhMula: new Date('2026-01-06'), tarikhTamat: new Date('2026-01-10'), status: 'aktif' },
    { kodKursus: 'ADTEC-SDK/KP/2026/002', namaKursusBm: 'Pemasangan & Penyelenggaraan Penyaman Udara', namaKursusBi: 'Air Conditioning Installation & Maintenance', tempohJam: 60, namaPenyelaras: 'NORLIZA BINTI AHMAD', kategoriId: kp.id, tarikhMula: new Date('2026-02-03'), tarikhTamat: new Date('2026-02-14'), status: 'aktif' },
    { kodKursus: 'ADTEC-SDK/KP/2026/003', namaKursusBm: 'Kimpalan Arka Logam', namaKursusBi: 'Metal Arc Welding', tempohJam: 40, namaPenyelaras: 'NORLIZA BINTI AHMAD', kategoriId: kp.id, tarikhMula: new Date('2026-03-02'), tarikhTamat: new Date('2026-03-06'), status: 'aktif' },
    { kodKursus: 'ADTEC-SDK/PI/2026/001', namaKursusBm: 'Pengaturcaraan PLC Asas', namaKursusBi: 'Basic PLC Programming', tempohJam: 80, namaPenyelaras: 'HAJI MOHAMED', kategoriId: pi.id, tarikhMula: new Date('2026-04-07'), tarikhTamat: new Date('2026-04-25'), status: 'aktif' },
    { kodKursus: 'ADTEC-SDK/PI/2026/002', namaKursusBm: 'Pengendalian Robot Industri', namaKursusBi: 'Industrial Robot Operation', tempohJam: 60, namaPenyelaras: 'HAJI MOHAMED', kategoriId: pi.id, tarikhMula: new Date('2026-05-05'), tarikhTamat: new Date('2026-05-16'), status: 'aktif' },
    { kodKursus: 'ADTEC-SDK/BK/2026/001', namaKursusBm: 'Bengkel Automotif Asas', namaKursusBi: 'Basic Automotive Workshop', tempohJam: 24, namaPenyelaras: 'NORLIZA BINTI AHMAD', kategoriId: bk.id, tarikhMula: new Date('2026-06-02'), tarikhTamat: new Date('2026-06-04'), status: 'aktif' },
    { kodKursus: 'ADTEC-SDK/LDS/2026/001', namaKursusBm: 'Kursus Keselamatan & Kesihatan Pekerjaan', namaKursusBi: 'Occupational Safety & Health Course', tempohJam: 16, namaPenyelaras: 'HAJI MOHAMED', kategoriId: lds.id, tarikhMula: new Date('2026-03-15'), tarikhTamat: new Date('2026-03-16'), status: 'tamat' },
  ]

  const createdCourses = []
  for (const c of courses) {
    const course = await db.kursus.create({
      data: { ...c, diciptaOlehId: admin.id }
    })
    createdCourses.push(course)
  }

  console.log('✅ Courses created')

  // 5. Create sample participants
  // Helper: hash MyKad for lookup
  async function hashMyKadLocal(mykad: string): Promise<string> {
    const encoder = new TextEncoder()
    const data = encoder.encode(mykad)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('')
  }

  const participantsData = [
    // Course 1: Pendawaian Elektrik Domestik
    { namaPenuh: 'AMIRUL BIN ABDULLAH', noMykad: '901231125678', jantina: 'lelaki', noTelefon: '0123456789', emel: 'amirul@email.com' },
    { namaPenuh: 'SITI NURHALIZA BINTI MOHAMED', noMykad: '910215145678', jantina: 'perempuan', noTelefon: '0123456790', emel: 'siti@email.com' },
    { namaPenuh: 'AHMAD FAIZAL BIN HASSAN', noMykad: '890506135678', jantina: 'lelaki', noTelefon: '0123456791' },
    { namaPenuh: 'NURUL AIN BINTI IBRAHIM', noMykad: '920810146789', jantina: 'perempuan', noTelefon: '0123456792' },
    { namaPenuh: 'MUHAMMAD HAFIZ BIN YUSOF', noMykad: '950317125678', jantina: 'lelaki', noTelefon: '0123456793' },
    // Course 2: Penyaman Udara
    { namaPenuh: 'AMIRUL BIN ABDULLAH', noMykad: '901231125678', jantina: 'lelaki', noTelefon: '0123456789' },
    { namaPenuh: 'KAMAL AZRIN BIN OTHMAN', noMykad: '880722135678', jantina: 'lelaki', noTelefon: '0123456794' },
    { namaPenuh: 'FATIMAH ZAHRA BINTI ALI', noMykad: '930415146789', jantina: 'perempuan', noTelefon: '0123456795' },
    // Course 3: Kimpalan
    { namaPenuh: 'AHMAD FAIZAL BIN HASSAN', noMykad: '890506135678', jantina: 'lelaki', noTelefon: '0123456791' },
    { namaPenuh: 'JASNI BIN DOLLAH', noMykad: '871101125678', jantina: 'lelaki', noTelefon: '0123456796' },
    { namaPenuh: 'ROZITA BINTI MD NOOR', noMykad: '940628146789', jantina: 'perempuan', noTelefon: '0123456797' },
    // Course 4: PLC
    { namaPenuh: 'KAMAL AZRIN BIN OTHMAN', noMykad: '880722135678', jantina: 'lelaki', noTelefon: '0123456794' },
    { namaPenuh: 'SITI NURHALIZA BINTI MOHAMED', noMykad: '910215145678', jantina: 'perempuan', noTelefon: '0123456790' },
    { namaPenuh: 'ZULKIFLI BIN MAMAT', noMykad: '900409125678', jantina: 'lelaki', noTelefon: '0123456798' },
    // Course 5: Robot
    { namaPenuh: 'MUHAMMAD HAFIZ BIN YUSOF', noMykad: '950317125678', jantina: 'lelaki', noTelefon: '0123456793' },
    { namaPenuh: 'NURUL AIN BINTI IBRAHIM', noMykad: '920810146789', jantina: 'perempuan', noTelefon: '0123456792' },
    // Course 6: Automotif
    { namaPenuh: 'JASNI BIN DOLLAH', noMykad: '871101125678', jantina: 'lelaki', noTelefon: '0123456796' },
    { namaPenuh: 'AMIRUL BIN ABDULLAH', noMykad: '901231125678', jantina: 'lelaki', noTelefon: '0123456789' },
    { namaPenuh: 'FATIMAH ZAHRA BINTI ALI', noMykad: '930415146789', jantina: 'perempuan', noTelefon: '0123456795' },
    // Course 7: KKP (tamat) 
    { namaPenuh: 'AHMAD FAIZAL BIN HASSAN', noMykad: '890506135678', jantina: 'lelaki', noTelefon: '0123456791' },
    { namaPenuh: 'SITI NURHALIZA BINTI MOHAMED', noMykad: '910215145678', jantina: 'perempuan', noTelefon: '0123456790' },
  ]

  let sijilCount = 0
  for (let i = 0; i < participantsData.length; i++) {
    const p = participantsData[i]
    // Determine which course
    let courseIndex = 0
    if (i >= 5 && i < 8) courseIndex = 1
    else if (i >= 8 && i < 11) courseIndex = 2
    else if (i >= 11 && i < 14) courseIndex = 3
    else if (i >= 14 && i < 16) courseIndex = 4
    else if (i >= 16 && i < 19) courseIndex = 5
    else if (i >= 19) courseIndex = 6

    const courseId = createdCourses[courseIndex].id
    const noMykadHash = await hashMyKadLocal(p.noMykad)

    const participant = await db.peserta.create({
      data: {
        namaPenuh: p.namaPenuh,
        noMykad: p.noMykad,
        noMykadHash,
        jantina: p.jantina as any,
        noTelefon: p.noTelefon,
        emel: p.emel,
        statusKelayakan: 'layak',
        kursusId: courseId,
      }
    })

    // Create certificate for some participants (all in completed course, some in active)
    const shouldCreateSijil = courseIndex === 6 || (courseIndex < 3 && i < 8)
    if (shouldCreateSijil) {
      sijilCount++
      const catCode = ['KP', 'KP', 'KP', 'PI', 'PI', 'BK', 'LDS'][courseIndex]
      const noSiri = `ADTEC/SDK/2026/${catCode}/${sijilCount.toString().padStart(5, '0')}`
      
      await db.sijil.create({
        data: {
          noSiri,
          kodQr: `https://esijil.adtecsandakan.gov.my/sahkan/${noSiri}`,
          status: 'sah',
          pesertaId: participant.id,
          kursusId: courseId,
          templatId: templat.id,
          versiTemplat: 1,
          dijanaPada: new Date(),
        }
      })
    }
  }

  console.log('✅ Participants and certificates created')

  // 6. Create system settings
  await db.tetapanSistem.create({
    data: {
      namaInstitusi: 'ADTEC JTM Kampus Sandakan',
      alamatInstitusi: 'Jabatan Tenaga Manusia, Kementerian Sumber Manusia, Sandakan, Sabah',
      emelHubungan: 'adtec.sandakan@jtm.gov.my',
      telefonHubungan: '089-222444',
      namaPengarah: 'TS. DR. MOHD YUSRI BIN MOHD YUSOF',
      laluanLogo: '/logo-adtec.png',
      teksPengaki: 'Sijil ini dikeluarkan oleh Kolej Teknologi Termaju (ADTEC) JTM Kampus Sandakan, Jabatan Tenaga Manusia, Kementerian Sumber Manusia, Malaysia.',
    }
  })

  console.log('✅ System settings created')

  // 7. Create some audit logs
  await db.logAudit.create({
    data: {
      tindakan: 'cipta',
      entiti: 'sistem',
      butiran: 'Pembenihan pangkalan data awal',
      alamatIp: '127.0.0.1',
      penggunaId: superAdmin.id,
    }
  })

  console.log('✅ Audit logs created')
  console.log('🎉 Seeding complete!')
  console.log('📋 Admin login: admin@adtec.gov.my / Admin@2026')
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect())
