import { ConnectWallet } from '../components/ConnectWallet'
import UploadCSV from '../components/UploadCSV'
import DepositCard from '../components/DepositCard'
import DisburseForm from '../components/DisburseForm'
import AuditDashboard from '../components/AuditDashboard'

function AdminPage() {
  const steps = [
    { number: 1, title: 'Upload Recipients', component: <UploadCSV /> },
    { number: 2, title: 'Deposit Funds', component: <DepositCard /> },
    { number: 3, title: 'Disburse', component: <DisburseForm /> },
    { number: 4, title: 'Audit', component: <AuditDashboard /> },
  ]

  return (
    <div data-testid="admin-page" className="min-h-screen bg-gray-900 text-white">
      {/* Fixed top bar with ConnectWallet */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-semibold">VeilPay Admin</h1>
          <ConnectWallet />
        </div>
      </header>

      {/* Main content with padding for fixed header */}
      <main className="max-w-4xl mx-auto px-4 pt-20 pb-12">
        <div className="space-y-6">
          {steps.map((step) => (
            <section
              key={step.number}
              className="bg-gray-800/50 border border-gray-700 rounded-xl p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-sm font-bold">
                  {step.number}
                </span>
                <h2 className="text-lg font-medium">{step.title}</h2>
              </div>
              <div className="ml-11">{step.component}</div>
            </section>
          ))}
        </div>
      </main>
    </div>
  )
}

export default AdminPage
