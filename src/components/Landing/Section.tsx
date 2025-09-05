'use client'

import { ArrowRight, Calendar, Crown, Palette, Settings, Sparkles, Users, type LucideIcon } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

import { Button } from '@/components/ui/button';

// Mapeo de strings a componentes de íconos
const iconMap: Record<string, LucideIcon> = {
  Calendar,
  Crown,
  Palette,
  Settings,
  Sparkles,
  Users,
};

interface Props {
  icon: LucideIcon | string;
  title: string;
  subtitle: string;
  actionText?: string;
  actionHref?: string;
  children: React.ReactNode;

  paddingY?: string;
  containerClassName?: string;
  wrapperElement?: 'div' | 'section';
  headerClassName?: string;
}

export const Section: React.FC<Props> = ({
  actionHref,
  actionText,
  children,
  containerClassName = 'container mx-auto px-6',
  headerClassName = '',
  icon,
  paddingY = 'py-16 lg:py-24',
  subtitle,
  title,
  wrapperElement: WrapperElement = 'div'
}) => {
  // Resolver el ícono si es un string
  const Icon = typeof icon === 'string' ? iconMap[ icon ] : icon;
  return (
    <WrapperElement className={paddingY}>
      <div className={containerClassName}>
        <div
          className={`mb-12 animate-fade-in-up ${headerClassName}`}
        >
          <div className='flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between'>
            <div className='flex items-start gap-4'>
              <div className='flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary-container text-primary shadow-elevation-1'>
                <Icon className='size-6 text-primary-foreground dark:text-white' />
              </div>
              <div>
                <h2 className='text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl'>{title}</h2>
                <p className='mt-3 max-w-2xl text-lg leading-relaxed text-muted-foreground'>{subtitle}</p>
              </div>
            </div>

            {actionText && actionHref && (
              <div className='animate-fade-in-up' style={{ animationDelay: '0.2s' }}>
                <Button asChild size='lg' variant='container-success'>
                  <Link href={actionHref} className='flex items-center gap-2'>
                    {actionText}
                    <ArrowRight className='size-4' />
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>

        {children}
      </div>
    </WrapperElement>
  );
};