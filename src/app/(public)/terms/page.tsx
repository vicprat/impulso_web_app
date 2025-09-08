import { CTA } from './components/CTA'
import { Hero } from './components/Hero'

interface TermsType {
  id: string
  title: string
  content: string
}

const termsSections: TermsType[] = [
  {
    content: 'La dirección de nuestra web es: http://impulsogaleria.com.',
    id: '1',
    title: 'Quiénes somos',
  },
  {
    content:
      'Cuando los visitantes dejan comentarios en la web, recopilamos los datos que se muestran en el formulario de comentarios, así como la dirección IP del visitante y la cadena de agentes de usuario del navegador para ayudar a la detección de spam.\n\nUna cadena anónima creada a partir de tu dirección de correo electrónico (también llamada hash) puede ser proporcionada al servicio de Gravatar para ver si la estás usando. La política de privacidad del servicio Gravatar está disponible aquí: https://automattic.com/privacy/. Después de la aprobación de tu comentario, la imagen de tu perfil es visible para el público en el contexto de su comentario.',
    id: '2',
    title: 'Comentarios',
  },
  {
    content:
      'Si subes imágenes a la web deberías evitar subir imágenes con datos de ubicación (GPS EXIF) incluidos. Los visitantes de la web pueden descargar y extraer cualquier dato de localización de las imágenes de la web.',
    id: '3',
    title: 'Medios',
  },
  {
    content:
      'Si dejas un comentario en nuestro sitio puedes elegir guardar tu nombre, dirección de correo electrónico y web en cookies. Esto es para tu comodidad, para que no tengas que volver a rellenar tus datos cuando dejes otro comentario. Estas cookies tendrán una duración de un año.\n\nSi tienes una cuenta y te conectas a este sitio, instalaremos una cookie temporal para determinar si tu navegador acepta cookies. Esta cookie no contiene datos personales y se elimina al cerrar el navegador.\n\nCuando inicias sesión, también instalaremos varias cookies para guardar tu información de inicio de sesión y tus opciones de visualización de pantalla. Las cookies de inicio de sesión duran dos días, y las cookies de opciones de pantalla duran un año. Si seleccionas "Recordarme", tu inicio de sesión perdurará durante dos semanas. Si sales de tu cuenta, las cookies de inicio de sesión se eliminarán.\n\nSi editas o publicas un artículo se guardará una cookie adicional en tu navegador. Esta cookie no incluye datos personales y simplemente indica el ID del artículo que acabas de editar. Caduca después de 1 día.',
    id: '4',
    title: 'Cookies',
  },
  {
    content:
      'Los artículos de este sitio pueden incluir contenido incrustado (por ejemplo, vídeos, imágenes, artículos, etc.). El contenido incrustado de otras web se comporta exactamente de la misma manera que si el visitante hubiera visitado la otra web.\n\nEstas web pueden recopilar datos sobre ti, utilizar cookies, incrustar un seguimiento adicional de terceros, y supervisar tu interacción con ese contenido incrustado, incluido el seguimiento de tu interacción con el contenido incrustado si tienes una cuenta y estás conectado a esa web.',
    id: '5',
    title: 'Contenido incrustado de otros sitios web',
  },
  {
    content:
      'Si solicitas un restablecimiento de contraseña, tu dirección IP será incluida en el correo electrónico de restablecimiento.',
    id: '6',
    title: 'Con quién compartimos tus datos',
  },
  {
    content:
      'Si dejas un comentario, el comentario y sus metadatos se conservan indefinidamente. Esto es para que podamos reconocer y aprobar comentarios sucesivos automáticamente en lugar de mantenerlos en una cola de moderación.\n\nDe los usuarios que se registran en nuestra web (si los hay), también almacenamos la información personal que proporcionan en su perfil de usuario. Todos los usuarios pueden ver, editar o eliminar su información personal en cualquier momento (excepto que no pueden cambiar su nombre de usuario). Los administradores de la web también pueden ver y editar esa información.',
    id: '7',
    title: 'Cuánto tiempo conservamos tus datos',
  },
  {
    content:
      'Si tienes una cuenta o has dejado comentarios en esta web, puedes solicitar recibir un archivo de exportación de los datos personales que tenemos sobre ti, incluyendo cualquier dato que nos hayas proporcionado. También puedes solicitar que eliminemos cualquier dato personal que tengamos sobre ti. Esto no incluye ningún dato que estemos obligados a conservar con fines administrativos, legales o de seguridad.',
    id: '8',
    title: 'Qué derechos tienes sobre tus datos',
  },
  {
    content:
      'Los comentarios de los visitantes puede que los revise un servicio de detección automática de spam.',
    id: '9',
    title: 'Dónde enviamos tus datos',
  },
]

export default function Page() {
  return (
    <>
      <div className='min-h-screen'>
        <Hero />

        <section className='py-16 lg:py-24' aria-label='Términos y condiciones'>
          <div className='container mx-auto px-6'>
            <div className='space-y-12'>
              {termsSections.map((section) => (
                <div key={section.id} className='border-b border-gray-200 pb-8 last:border-b-0'>
                  <div className='mb-4'>
                    <h2 className='mb-2 text-2xl font-bold'>{section.title}</h2>
                    <p className='text-sm font-medium'>Texto sugerido:</p>
                  </div>
                  <div className='max-w-none'>
                    {section.content.split('\n\n').map((paragraph, pIndex) => (
                      <p key={pIndex} className='mb-4 leading-relaxed last:mb-0'>
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <CTA />
          </div>
        </section>
      </div>
    </>
  )
}
