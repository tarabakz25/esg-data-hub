import Link from 'next/link'

export default function DashboardLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">
              ESG IR Dashboard
            </h1>
            <nav className="flex space-x-4">
              <a
                href="/dashboard/ingest" 
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Data Upload
              </a>
              <a
                href="/dashboard/mapping" 
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Auto Mapping
              </a>
              <a
                href="/dashboard/kpis" 
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                KPI Data
              </a>
              <a
                href="/dashboard/compliance" 
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Compliance
              </a>
            </nav>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
} 
