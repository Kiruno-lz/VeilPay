import { ConnectWallet } from '../components/ConnectWallet'
import UploadCSV from '../components/UploadCSV'
import DepositCard from '../components/DepositCard'
import DisburseForm from '../components/DisburseForm'
import AuditDashboard from '../components/AuditDashboard'
import Card from '../components/ui/Card'
import { useWalletBalance } from '../hooks/useWalletBalance'
import { useAppState } from '../context/useAppState'
import { cn } from '../lib/utils'

function AdminPage() {
  const { publicUsdc, shieldedUsdc } = useWalletBalance()
  const { state } = useAppState()

  const steps = [
    { number: 1, title: 'Upload Recipients', component: <UploadCSV /> },
    { number: 2, title: 'Deposit Funds', component: <DepositCard /> },
    { number: 3, title: 'Disburse', component: <DisburseForm /> },
    { number: 4, title: 'Audit', component: <AuditDashboard /> },
  ]

  const currentStep = state.ui.currentStep

  const formatUsdc = (value: number | null) => {
    if (value === null) return '—'
    return value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  return (
    <div data-testid="admin-page" className="min-h-screen bg-neutral-900 text-neutral-100">
      {/* 1. Top Bar (Header) — Fixed, full-width */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-primary-950 border-b border-primary-900">
        <div className="max-w-5xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-neutral-0 leading-tight">VeilPay</span>
            <span className="text-sm text-primary-300 hidden sm:block">Privacy payroll on Solana</span>
          </div>
          <ConnectWallet />
        </div>
      </header>

      {/* Spacer for fixed header */}
      <div className="h-14" />

      {/* 2. Hero Section — full-width color block */}
      <section
        data-testid="hero-section"
        className="bg-primary-950 py-16 px-6"
      >
        <div className="max-w-5xl mx-auto">
          <h1 className="text-5xl font-extrabold text-neutral-0 mb-4">
            Pay your team privately
          </h1>
          <p className="text-lg text-primary-200 max-w-2xl">
            Private USDC payroll on Solana.
          </p>
        </div>
      </section>

      {/* Main content area */}
      <main className="max-w-5xl mx-auto px-4 md:px-6 py-8 pb-12 space-y-12">
        {/* 3. Stats Row — 2 full-width color blocks */}
        <section data-testid="stats-section" className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl p-6 bg-neutral-800">
            <p className="text-sm text-neutral-400 mb-1">USDC Balance</p>
            <p className="text-4xl font-bold text-neutral-0 font-mono">
              ${formatUsdc(publicUsdc)}
            </p>
            <p className="text-sm text-success-500 mt-1">Public wallet</p>
          </div>

          <div className="rounded-xl p-6 bg-primary-500">
            <p className="text-sm text-primary-100 mb-1">Shielded in Pool</p>
            <p className="text-4xl font-bold text-neutral-0 font-mono">
              ${formatUsdc(shieldedUsdc)}
            </p>
            <p className="text-sm text-primary-100 mt-1">Cloak pool</p>
          </div>
        </section>

        {/* 4. Step Sections */}
        <section data-testid="steps-section" className="space-y-4">
          {steps.map((step) => {
            const isActive = step.number === currentStep
            return (
              <Card
                key={step.number}
                id={`step-${step.number}`}
                data-testid={`step-${step.number}`}
                className={cn(
                  isActive
                    ? 'bg-primary-500 text-neutral-0'
                    : 'bg-neutral-800 text-neutral-100'
                )}
              >
                <div className="flex items-start gap-4">
                  <span className={cn(
                    'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold',
                    isActive
                      ? 'bg-neutral-0 text-primary-500'
                      : 'bg-primary-500 text-neutral-0'
                  )}>
                    {step.number}
                  </span>
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold mb-4">
                      {step.title}
                    </h2>
                    <div>{step.component}</div>
                  </div>
                </div>
              </Card>
            )
          })}
        </section>
      </main>
    </div>
  )
}

export default AdminPage
