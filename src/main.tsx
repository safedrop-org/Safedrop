
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { GoogleAnalytics } from './lib/analytics'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
})

const container = document.getElementById("root")
const root = createRoot(container!)

// Add Google Analytics to head if in production
if (process.env.NODE_ENV === 'production') {
  const analyticsContainer = document.createElement('div')
  document.head.appendChild(analyticsContainer)
  const analyticsRoot = createRoot(analyticsContainer)
  analyticsRoot.render(<GoogleAnalytics />)
}

root.render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
)
