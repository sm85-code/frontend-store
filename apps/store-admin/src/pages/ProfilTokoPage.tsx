import type { ProfilToko } from '@store/shared'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'
import { api, errorMessage } from '@/lib/api'
import { PageTitle, ErrorLine, Field } from '@/components/erp'
import Spinner from '@/components/Spinner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

const groups: { title: string; fields: [keyof ProfilToko, string, string?, number?][] }[] = [
  { title: 'Identitas & kontak', fields: [['nama', 'Nama toko', 'text', 128], ['email', 'Email', 'email', 254], ['telepon', 'Nomor HP / telepon', 'tel', 32], ['whatsapp', 'WhatsApp (kode negara, contoh 6281313511101)', 'tel', 15], ['jam', 'Jam layanan', 'text', 255]] },
  { title: 'Alamat usaha', fields: [['jalan', 'Jalan / RT / RW', 'text', 500], ['desa', 'Desa / kelurahan', 'text', 128], ['kecamatan', 'Kecamatan', 'text', 128], ['kabupaten', 'Kota / kabupaten', 'text', 128], ['provinsi', 'Provinsi', 'text', 128], ['kodePos', 'Kode pos', 'text', 5]] },
  { title: 'Media sosial', fields: [['instagram', 'URL Instagram', 'url', 500], ['instagramNama', 'Nama Instagram', 'text', 128], ['tiktok', 'URL TikTok', 'url', 500], ['tiktokNama', 'Nama TikTok', 'text', 128]] },
]

function ProfileForm({ initial }: { initial: ProfilToko }) {
  const [values, setValues] = useState(initial)
  const qc = useQueryClient()
  const save = useMutation({ mutationFn: () => api.simpanProfilToko(values), onSuccess: (data) => {
    setValues(data); qc.setQueryData(['profil-toko'], data); toast.success('Profil toko disimpan')
  } })
  return <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); save.mutate() }}>
    <fieldset disabled={save.isPending} className="space-y-4">
      {groups.map((group) => <Card key={group.title}>
        <CardHeader><CardTitle>{group.title}</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          {group.fields.map(([key, label, type, maxLength]) => <Field key={key} label={label} htmlFor={`profil-${key}`} className={key === 'jalan' || key === 'jam' ? 'sm:col-span-2' : ''}>
            <Input id={`profil-${key}`} type={type} maxLength={maxLength} required={group.title !== 'Media sosial'} value={values[key]} onChange={(e) => setValues((old) => ({ ...old, [key]: e.target.value }))} pattern={key === 'whatsapp' ? '[1-9][0-9]{7,14}' : key === 'kodePos' ? '[0-9]{5}' : undefined} />
          </Field>)}
        </CardContent>
      </Card>)}
      {save.error ? <ErrorLine message={errorMessage(save.error)} /> : null}
      <div className="flex justify-end"><Button type="submit">{save.isPending ? 'Menyimpan…' : 'Simpan profil'}</Button></div>
    </fieldset>
  </form>
}

export default function ProfilTokoPage() {
  const profile = useQuery({ queryKey: ['profil-toko'], queryFn: api.profilToko })
  return <div className="space-y-4"><PageTitle title="Profil Toko" />
    {profile.isPending ? <Spinner column /> : profile.error ? <div className="space-y-3"><ErrorLine message={errorMessage(profile.error)} /><Button variant="outline" onClick={() => void profile.refetch()}>Coba lagi</Button></div> : <ProfileForm initial={profile.data} />}
  </div>
}
