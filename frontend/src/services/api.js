import axios from 'axios'
import toast  from 'react-hot-toast'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BACKEND_URL || '/api',
  timeout: 10000,
})

let isRedirecting = false

api.interceptors.response.use(
  res => res,
  err => {
    const msg    = err.response?.data?.message || 'Something went wrong'
    const status = err.response?.status

    if (status === 401) {
      if (!isRedirecting) {
        isRedirecting = true
        localStorage.removeItem('park-auth')
        toast.error('Session expired. Please log in again.')
        setTimeout(() => {
          isRedirecting = false
          window.location.replace('/login')
        }, 800)
      }
    } else if (status === 404) {
      // let caller handle 404 silently
    } else if (status >= 500) {
      toast.error('Server error. Please try again.')
    } else if (!err.response) {
      console.warn('Network error — backend may not be running:', err.message)
    } else {
      toast.error(msg)
    }
    return Promise.reject(err)
  }
)

export default api
