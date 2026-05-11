import '../happy-dom-setup'
import { describe, it, expect } from 'bun:test'
import { render } from '@testing-library/react'
import { AppStateProvider } from '../context/AppState'
import UploadCSV from './UploadCSV'
import DepositCard from './DepositCard'
import DisburseForm from './DisburseForm'
import AuditDashboard from './AuditDashboard'

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AppStateProvider>{children}</AppStateProvider>
)

describe('UploadCSV', () => {
  it('renders with correct test id and placeholder text', () => {
    const { getByTestId, getByText } = render(<UploadCSV />)
    expect(getByTestId('upload-csv')).toBeTruthy()
    expect(getByText('Drag & drop CSV file here')).toBeTruthy()
    expect(getByText('1')).toBeTruthy()
  })

  it('applies className prop', () => {
    const { getByTestId } = render(<UploadCSV className="custom-class" />)
    expect(getByTestId('upload-csv').classList.contains('custom-class')).toBe(true)
  })
})

describe('DepositCard', () => {
  it('renders with correct test id and placeholder text', () => {
    const { getByTestId, getByText } = render(<DepositCard />)
    expect(getByTestId('deposit-card')).toBeTruthy()
    expect(getByText('Enter amount to deposit')).toBeTruthy()
    expect(getByText('2')).toBeTruthy()
  })

  it('has disabled deposit button', () => {
    const { getByRole } = render(<DepositCard />)
    expect(getByRole('button', { name: 'Deposit' }).hasAttribute('disabled')).toBe(true)
  })

  it('applies className prop', () => {
    const { getByTestId } = render(<DepositCard className="custom-class" />)
    expect(getByTestId('deposit-card').classList.contains('custom-class')).toBe(true)
  })
})

describe('DisburseForm', () => {
  it('renders with correct test id and placeholder text', () => {
    const { getByTestId, getByText } = render(<DisburseForm />)
    expect(getByTestId('disburse-form')).toBeTruthy()
    expect(getByText('No recipients yet')).toBeTruthy()
    expect(getByText('3')).toBeTruthy()
  })

  it('has disabled disburse button', () => {
    const { getByRole } = render(<DisburseForm />)
    expect(getByRole('button', { name: 'Disburse' }).hasAttribute('disabled')).toBe(true)
  })

  it('applies className prop', () => {
    const { getByTestId } = render(<DisburseForm className="custom-class" />)
    expect(getByTestId('disburse-form').classList.contains('custom-class')).toBe(true)
  })
})

describe('AuditDashboard', () => {
  it('renders with correct test id and placeholder text', () => {
    const { getByTestId, getByText } = render(<AuditDashboard />, { wrapper })
    expect(getByTestId('audit-dashboard')).toBeTruthy()
    expect(getByText('Viewing keys will appear here')).toBeTruthy()
    expect(getByText('4')).toBeTruthy()
  })

  it('has generate key button', () => {
    const { getByRole } = render(<AuditDashboard />, { wrapper })
    expect(getByRole('button', { name: 'Generate Key' })).toBeTruthy()
  })

  it('applies className prop', () => {
    const { getByTestId } = render(<AuditDashboard className="custom-class" />, { wrapper })
    expect(getByTestId('audit-dashboard').classList.contains('custom-class')).toBe(true)
  })
})
