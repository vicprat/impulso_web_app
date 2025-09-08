import { routeMetadata } from '@/lib/metadata'
import { Card } from '@/src/components/Card'

import { CTA } from './components/CTA'
import { Hero } from './components/Hero'

import type { Metadata } from 'next'

export const metadata: Metadata = routeMetadata['/services']

export interface Service {
  id: string
  title: string
  description: string
  imageUrl: string
  iconName: string
  features: string[]
  price?: string
  popular?: boolean
  size?: 'normal' | 'large'
}

const services: Service[] = [
  {
    description:
      'Desarrollamos artistas a través de la venta de obra original y gráfica (fotografía, serigrafía, grabado) de talentos mexicanos consagrados, emergentes y nuevos.',
    features: [
      'Obra original certificada',
      'Gráfica limitada',
      'Artistas emergentes',
      'Asesoría personalizada',
    ],
    iconName: 'DollarSign', // Cambiado a string
    id: '1',
    imageUrl:
      'https://xhsidbbijujrdjjymhbs.supabase.co/storage/v1/object/public/images/general/expo-colectiva.jpg',
    popular: true,
    price: 'Desde $500',
    size: 'large',
    title: 'Venta de Obra Original',
  },
  {
    description:
      'Mantenemos altos estándares de calidad para la conservación de obras de arte, recuerdos, fotografías y objetos valiosos.',
    features: ['Marcos premium', 'Cristales UV', 'Conservación museística', 'Garantía de por vida'],
    iconName: 'Frame', // Cambiado a string
    id: '2',
    imageUrl:
      'https://xhsidbbijujrdjjymhbs.supabase.co/storage/v1/object/public/images/general/IMG_3321-scaled.webp',
    price: 'Cotización',
    title: 'Enmarcado Profesional',
  },
  {
    description:
      'Equipos de alta calidad para reproducciones de arte y variedad de papeles para satisfacer todas las necesidades.',
    features: ['Impresión Giclée', 'Papeles de museo', 'Ediciones limitadas', 'Control de color'],
    iconName: 'Printer', // Cambiado a string
    id: '3',
    imageUrl:
      'https://xhsidbbijujrdjjymhbs.supabase.co/storage/v1/object/public/images/general/IMG_9333.jpeg',
    price: 'Cotización',
    title: 'Estudio de Impresión',
  },
  {
    description:
      'El arte como inversión mantiene su valor y se comporta de manera diferente a otros activos financieros.',
    features: [
      'Asesoría especializada',
      'Valuación profesional',
      'Portfolio diversificado',
      'ROI documentado',
    ],
    iconName: 'TrendingUp', // Cambiado a string
    id: '4',
    imageUrl:
      'https://xhsidbbijujrdjjymhbs.supabase.co/storage/v1/object/public/images/general/Mira-de-frente-a-tus-suenos-y-ellos-te-observaran-desde-la-gloria-dnomada-arte-huesos-tigre-art-gold-color-dorado-tiger-vida-corazon-de-tigre-una-obra-que-se-inspira-en-la-inmortalidad-del-s.jpg',
    popular: true,
    price: 'Consultoría',
    size: 'large',
    title: 'Inversión en Arte',
  },
  {
    description:
      'Facilita el colgado de cuadros con una gama completa de sistemas de colgaje profesionales.',
    features: ['Sistemas modulares', 'Hardware premium', 'Instalación incluida', 'Soporte técnico'],
    iconName: 'Image', // Cambiado a string
    id: '5',
    imageUrl:
      'https://xhsidbbijujrdjjymhbs.supabase.co/storage/v1/object/public/images/general/unnamed%20(1).png',
    price: 'Cotización',
    title: 'Sistema de Colgajes',
  },
  {
    description:
      'Impresión especializada de revistas, folletos, catálogos y libros de arte en grandes cantidades.',
    features: ['Diseño editorial', 'Acabados premium', 'Tirajes grandes', 'Distribución'],
    iconName: 'BookOpen', // Cambiado a string
    id: '6',
    imageUrl:
      'https://xhsidbbijujrdjjymhbs.supabase.co/storage/v1/object/public/images/general/WhatsApp-Image-2024-03-11-at-6.06.29-PM.jpeg',
    price: 'Cotización',
    title: 'Catálogos y Libros de Arte',
  },
]

export default function Page() {
  return (
    <>
      <div className='min-h-screen '>
        <Hero />

        <section className='py-16 lg:py-24' aria-label='Servicios disponibles'>
          <div className='container mx-auto px-6'>
            <div className='grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 lg:gap-12'>
              {services.map((service, index) => (
                <Card.Service key={service.id} service={service} index={index} />
              ))}
            </div>
            <CTA />
          </div>
        </section>
      </div>
    </>
  )
}
