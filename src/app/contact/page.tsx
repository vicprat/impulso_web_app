import { contactMetadata } from '@/lib/metadata'

import type { Metadata } from 'next'

export const metadata: Metadata = contactMetadata

export default function ContactPage() {
  return (
    <div className='min-h-screen bg-surface py-16'>
      <div className='container mx-auto px-4'>
        <div className='mx-auto max-w-4xl'>
          <h1 className='mb-8 text-4xl font-bold text-foreground'>Contacto - Impulso Galería</h1>

          <div className='grid gap-12 md:grid-cols-2'>
            {/* Información de Contacto */}
            <div className='space-y-8'>
              <div>
                <h2 className='mb-4 text-2xl font-semibold text-foreground'>
                  Información de Contacto
                </h2>
                <div className='space-y-4 text-muted-foreground'>
                  <p>
                    <strong>Dirección:</strong>
                    <br />
                    Hacienda Escolásticas 107
                    <br />
                    Jardines de la Hacienda
                    <br />
                    76180 Santiago de Querétaro, Qro.
                  </p>
                  <p>
                    <strong>Teléfono:</strong>
                    <br />
                    <a href='tel:+524422165203' className='text-primary hover:underline'>
                      442 216 5203
                    </a>
                  </p>
                  <p>
                    <strong>Horarios:</strong>
                    <br />
                    Lunes a Viernes: 9:00 AM - 6:00 PM
                    <br />
                    Sábados: 10:00 AM - 4:00 PM
                    <br />
                    Domingos: Cerrado
                  </p>
                </div>
              </div>

              <div>
                <h3 className='mb-4 text-xl font-semibold text-foreground'>Redes Sociales</h3>
                <div className='space-y-2 text-muted-foreground'>
                  <p>Instagram: @impulsogaleria</p>
                  <p>Facebook: Impulso Galería</p>
                  <p>Email: info@impulsogaleria.com</p>
                </div>
              </div>
            </div>

            {/* Formulario de Contacto */}
            <div>
              <h2 className='mb-4 text-2xl font-semibold text-foreground'>Envíanos un Mensaje</h2>
              <form className='space-y-6'>
                <div>
                  <label htmlFor='name' className='mb-2 block text-sm font-medium text-foreground'>
                    Nombre
                  </label>
                  <input
                    type='text'
                    id='name'
                    name='name'
                    className='w-full rounded-lg border border-border px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-primary'
                    required
                  />
                </div>

                <div>
                  <label htmlFor='email' className='mb-2 block text-sm font-medium text-foreground'>
                    Email
                  </label>
                  <input
                    type='email'
                    id='email'
                    name='email'
                    className='w-full rounded-lg border border-border px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-primary'
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor='subject'
                    className='mb-2 block text-sm font-medium text-foreground'
                  >
                    Asunto
                  </label>
                  <input
                    type='text'
                    id='subject'
                    name='subject'
                    className='w-full rounded-lg border border-border px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-primary'
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor='message'
                    className='mb-2 block text-sm font-medium text-foreground'
                  >
                    Mensaje
                  </label>
                  <textarea
                    id='message'
                    name='message'
                    rows={5}
                    className='w-full rounded-lg border border-border px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-primary'
                    required
                  ></textarea>
                </div>

                <button
                  type='submit'
                  className='hover:bg-primary/90 w-full rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors'
                >
                  Enviar Mensaje
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
