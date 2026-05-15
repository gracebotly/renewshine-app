import { PushSetup } from '@/components/admin/PushSetup'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PushSetup />
      {children}
    </>
  )
}
