import { useSearchParams } from 'react-router-dom'

function ClaimPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  return (
    <div data-testid="claim-page">
      <h1>Claim</h1>
      {token && <div data-testid="claim-token">{token}</div>}
    </div>
  )
}

export default ClaimPage
