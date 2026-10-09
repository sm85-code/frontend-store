import 'server-only'
import { cache } from 'react'
import type { ProfilToko } from '@store/shared'
import { api } from './api'

/** Business contact details, shown on /kontak, in the footer and in policy pages. */
const DEFAULT_KONTAK: ProfilToko = {
  nama: 'AmpelKuning',
  email: 'ampelkuningdotcom@gmail.com',
  telepon: '0813-1351-1101',
  /** Digits only, with country code, for wa.me links. */
  whatsapp: '6281313511101',
  jalan: 'Jl. Ampelkuning, Dusun Padasuka RT. 003 RW. 019',
  desa: 'Desa Wonoharjo',
  kecamatan: 'Kec. Pangandaran',
  kabupaten: 'Kab. Pangandaran',
  provinsi: 'Jawa Barat',
  kodePos: '46396',
  jam: 'Senin – Sabtu, pukul 08.00 – 16.00 WIB',
  instagram: 'https://www.instagram.com/ampelkuningdotcom',
  instagramNama: '@ampelkuningdotcom',
  tiktok: 'https://www.tiktok.com/@ampelkuningdotcom',
  tiktokNama: '@ampelkuningdotcom',
}

export const getKontak = cache(async () => {
  let KONTAK = DEFAULT_KONTAK
  try { KONTAK = await api.profilToko() } catch (error) { console.error('Profil toko belum dapat dimuat', error instanceof Error ? error.message : 'API error') }
  const ALAMAT_LENGKAP = `${KONTAK.jalan}, ${KONTAK.desa}, ${KONTAK.kecamatan}, ${KONTAK.kabupaten}, ${KONTAK.provinsi} ${KONTAK.kodePos}`
  return { KONTAK, ALAMAT_LENGKAP, WA_LINK: `https://wa.me/${KONTAK.whatsapp}`, MAPS_LINK: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ALAMAT_LENGKAP)}` }
})
