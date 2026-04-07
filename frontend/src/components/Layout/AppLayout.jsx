import Sidebar from './Sidebar'

export default function AppLayout({ children, title }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto p-8">
          {title && (
            <h1 className="text-2xl font-bold text-slate-900 mb-6">{title}</h1>
          )}
          {children}
        </div>
      </main>
    </div>
  )
}
