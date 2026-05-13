import { ConnectWallet } from '../components/ConnectWallet'
import UploadCSV from '../components/UploadCSV'
import DepositCard from '../components/DepositCard'
import DisburseForm from '../components/DisburseForm'
import AuditDashboard from '../components/AuditDashboard'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
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
  const recipientsCount = state.recipients.length

  const scrollToStep = (stepNumber: number) => {
    const el = document.getElementById(`step-${stepNumber}`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

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
        className="relative bg-primary-900 py-16 px-6 overflow-hidden"
      >
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              'linear-gradient(to right, var(--neutral-0, #fff) 1px, transparent 1px), linear-gradient(to bottom, var(--neutral-0, #fff) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        <div className="relative max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold text-neutral-0 mb-4">
            Pay your team privately
          </h1>
          <p className="text-lg text-primary-200 max-w-2xl mb-8">
            Batch disburse USDC on Solana without exposing amounts or recipients on-chain.
          </p>
          <Button onClick={() => scrollToStep(1)} size="lg">
            Get Started
          </Button>
        </div>
      </section>

      {/* Main content area */}
      <main className="max-w-5xl mx-auto px-4 md:px-6 py-8 pb-12">
        {/* 3. Stats Row — 3-column grid of color block cards */}
        <section data-testid="stats-section" className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card variant="default">
            <p className="text-sm text-neutral-400 mb-1">USDC Balance</p>
            <p className="text-3xl font-bold text-neutral-0 font-mono">
              ${formatUsdc(publicUsdc)}
            </p>
            <p className="text-sm text-success-500 mt-1">Public wallet</p>
          </Card>

          <Card variant="color-block">
            <p className="text-sm text-primary-200 mb-1">Shielded in Pool</p>
            <p className="text-3xl font-bold text-neutral-0 font-mono">
              ${formatUsdc(shieldedUsdc)}
            </p>
            <p className="text-sm text-primary-300 mt-1">Cloak pool</p>
          </Card>

          <Card variant="default">
            <p className="text-sm text-neutral-400 mb-1">Pending Recipients</p>
            <p className="text-3xl font-bold text-neutral-0 font-mono">
              {recipientsCount}
            </p>
            <p className="text-sm text-neutral-500 mt-1">
              {recipientsCount === 1 ? '1 recipient' : `${recipientsCount} recipients`} loaded
            </p>
          </Card>
        </section>

        {/* 4. Step Sections */}
        <section data-testid="steps-section" className="space-y-4">
          {steps.map((step) => {
            const isActive = step.number === currentStep
            return (
              <section
                key={step.number}
                id={`step-${step.number}`}
                data-testid={`step-${step.number}`}
              >
                <Card
                  variant="left-accent"
                  className={cn(
                    isActive &&
                      'ring-1 ring-primary-500/40 shadow-lg shadow-primary-500/10'
                  )}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <span
                      className={cn(
                        'flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold',
                        isActive
                          ? 'bg-primary-500 text-neutral-0'
                          : 'bg-neutral-700 text-neutral-400 border border-neutral-600'
                      )}
                    >
                      {step.number}
                    </span>
                    <h2 className="text-lg font-semibold text-neutral-100">
                      {step.title}
                    </h2>
                  </div>
                  <div className="ml-11">{step.component}</div>
                </Card>
              </section>
            )
          })}
        </section>
      </main>

      {/* 5. Footer CTA — Full-width primary-500 color block */}
      <footer data-testid="footer-cta" className="bg-primary-500 py-10 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-xl font-semibold text-neutral-0">
              Ready to disburse?
            </p>
            <p className="text-sm text-primary-100 mt-1">
              All recipients loaded and funds deposited — go ahead.
            </p>
          </div>
          <Button
            variant="secondary"
            size="lg"
            onClick={() => scrollToStep(3)}
            className="shrink-0"
          >
            Go to Disburse
          </Button>
        </div>
      </footer>
    </div>
  )
}

export default AdminPage
