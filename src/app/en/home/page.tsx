import { redirect } from 'next/navigation'

// Redirección permanente de /en/home a /
export default function EnHomeRedirect() {
  redirect('/')
}
