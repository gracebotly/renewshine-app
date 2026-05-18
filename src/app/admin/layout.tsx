import { PushSetup } from '@/components/admin/PushSetup'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col" style={{ minHeight: '100svh' }}>
      <PushSetup />
      {children}
    </div>
  )
}
