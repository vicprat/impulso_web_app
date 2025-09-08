import { CTA } from './components/CTA'
import { Feature } from './components/Feature'
import { Hero } from './components/Hero'
import { MembershipCard } from './components/MembershipCard'

interface Benefit {
  id: string
  text: string
}

interface FeatureType {
  id: string
  title: string
  description: string
  iconName: string
}

const benefits: Benefit[] = [
  { id: '1', text: 'Venta de obras' },
  { id: '2', text: 'Impresión digital para reproducciones giclée' },
  { id: '3', text: 'Exposición internacional' },
  { id: '4', text: 'Publicidad' },
  { id: '5', text: 'Pagos seguros' },
  { id: '6', text: 'Sin exclusividad' },
  { id: '7', text: 'Nos encargamos de generar tus guías de envío' },
]

const features: FeatureType[] = [
  {
    description: 'Transacciones seguras y protección de tus obras',
    iconName: 'Shield',
    id: '1',
    title: 'SEGURIDAD',
  },
  {
    description: 'Presencia en exposiciones internacionales prestigiosas',
    iconName: 'Star',
    id: '2',
    title: 'RECONOCIMIENTO',
  },
  {
    description: 'Atención personalizada en cada paso del proceso',
    iconName: 'Headphones',
    id: '3',
    title: 'SOPORTE',
  },
  {
    description: 'Impresiones giclée de máxima calidad profesional',
    iconName: 'Settings',
    id: '4',
    title: 'CALIDAD',
  },
]

export default function Page() {
  return (
    <>
      <div className='min-h-screen'>
        <Hero />

        <section className='py-20'>
          <div className='container mx-auto px-6'>
            <div>
              <h2 className='text-4xl font-bold md:text-5xl'>¿POR QUÉ IMPULSO GALERÍA?</h2>
            </div>

            <div className='grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4'>
              {features.map((feature, index) => (
                <Feature key={feature.id} feature={feature} index={index} />
              ))}
            </div>
          </div>
        </section>

        <MembershipCard
          benefits={benefits}
          currency='$'
          price='500.00'
          period='MXN/mensual'
          title='Vende tus obras'
          subtitle='Mi espacio Impulso'
          description='ADQUIERA UN PLAN DE MEMBRESÍA Y DISFRUTE DE LOS GRANDES BENEFICIOS DE VENDER SU ARTE CON NOSOTROS.'
          buttonText='Más información'
        />

        <section className='py-16 lg:py-24' aria-label='Call to action'>
          <div className='container mx-auto px-6'>
            <CTA />
          </div>
        </section>
      </div>
    </>
  )
}
