import { FooterClient } from './Footer'

import { getContactContent, getNavigationLinks, getSocialLinks } from '@/lib/landing-data'

export async function Footer() {
  const [contactContent, footerContent, socialLinks, navigationLinks] = await Promise.all([
    getContactContent('info'),
    getContactContent('footer'),
    getSocialLinks(),
    getNavigationLinks(),
  ])

  return (
    <FooterClient
      contactContent={contactContent}
      footerContent={footerContent}
      socialLinks={socialLinks}
      navigationLinks={navigationLinks}
    />
  )
}
