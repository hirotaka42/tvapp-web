'use client';

import { useEffect, useRef } from 'react';
import { ServiceDockButton } from '@/components/atomicDesign/atoms/ServiceDockButton';
import { ServiceId, ServiceMeta } from '@/utils/service/serviceCatalog';

interface ServiceDockProps {
  services: ServiceMeta[];
  selected: ServiceId;
  onSelect: (service: ServiceId) => void;
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable;
}

export function ServiceDock({ services, selected, onSelect }: ServiceDockProps) {
  const dockRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target)) return;

      const hintMatch = services.find((service) => service.hint === event.key);
      if (hintMatch) {
        event.preventDefault();
        onSelect(hintMatch.id);
        return;
      }

      if (!dockRef.current?.contains(document.activeElement)) return;
      if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;

      event.preventDefault();
      const currentIndex = services.findIndex((service) => service.id === selected);
      const direction = event.key === 'ArrowRight' ? 1 : -1;
      const next = services[(currentIndex + direction + services.length) % services.length];
      onSelect(next.id);
      requestAnimationFrame(() => {
        document.getElementById(`dk-${next.id}`)?.focus();
      });
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onSelect, selected, services]);

  return (
    <nav className="dk" role="tablist" aria-label="視聴サービスの切替" ref={dockRef}>
      {services.map((service) => (
        <ServiceDockButton
          key={service.id}
          service={service.id}
          label={service.label}
          selected={selected === service.id}
          ready={service.ready}
          hint={service.hint}
          panelId={service.panelId}
          onSelect={onSelect}
        />
      ))}
    </nav>
  );
}
