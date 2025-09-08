import { redirect } from 'next/navigation'

// Redirección permanente de /gallery a /store
export default function GalleryRedirect() {
  redirect('/store')
}
