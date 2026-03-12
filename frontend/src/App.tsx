import { useState, useEffect } from 'react'
import './App.css'

const API_BASE = 'http://localhost:8000'

type ContentCreator = {
  id: number
  name: string
  email: string
  business: string
  social_views: number
}

function App() {
  const [contentCreators, setContentCreators] = useState<ContentCreator[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`${API_BASE}/api/content-creators/`)
      .then((res) => res.json())
      .then((data) => setContentCreators(data.content_creators))
      .catch(() => setError('Could not load content creators from backend'))
  }, [])

  if (error) return <p>{error}</p>
  if (contentCreators === null) return <p>Loading…</p>

  return (
    <div style={{ padding: '1.5rem' }}>
      <h1>Content Creators</h1>
      <table style={{ borderCollapse: 'collapse', width: '100%', marginTop: '1rem' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #333', textAlign: 'left' }}>
            <th style={{ padding: '0.5rem' }}>Name</th>
            <th style={{ padding: '0.5rem' }}>Email</th>
            <th style={{ padding: '0.5rem' }}>Business</th>
            <th style={{ padding: '0.5rem' }}>Social views</th>
          </tr>
        </thead>
        <tbody>
          {contentCreators.map((row) => (
            <tr key={row.id} style={{ borderBottom: '1px solid #ccc' }}>
              <td style={{ padding: '0.5rem' }}>{row.name}</td>
              <td style={{ padding: '0.5rem' }}>{row.email}</td>
              <td style={{ padding: '0.5rem' }}>{row.business}</td>
              <td style={{ padding: '0.5rem' }}>{row.social_views}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default App
