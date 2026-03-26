import { getContactContent, getNavigationLinks, getSocialLinks } from '@/lib/landing-data'

import { FooterClient } from './Footer'

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
