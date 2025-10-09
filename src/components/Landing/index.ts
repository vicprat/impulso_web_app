import { lazy } from 'react'

import { Artists } from './Artists'
import { Blog } from './Blog'
import { Carousel } from './Carrousel'
import { Events } from './Events'
import { LazyHero } from './Hero'
import { Products } from './Products'
import { Section } from './Section'
import { Services } from './Services'

const Hero = lazy(() => import('./Hero').then((module) => ({ default: module.Hero })))

export const Landing = {
  Artists,
  Blog,
  Carousel,
  Events,
  Hero,
  LazyHero,
  Products,
  Section,
  Services,
}
