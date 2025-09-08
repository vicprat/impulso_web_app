import { redirect } from 'next/navigation'

// Redirección permanente de /contact-us a /contact
export default function ContactUsRedirect() {
  redirect('/contact')
}
