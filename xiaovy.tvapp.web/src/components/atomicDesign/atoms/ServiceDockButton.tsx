import { ServiceId } from '@/utils/service/serviceCatalog';

interface ServiceDockButtonProps {
  service: ServiceId;
  label: string;
  selected: boolean;
  ready: boolean;
  hint?: string;
  panelId: string;
  onSelect: (service: ServiceId) => void;
}

export function ServiceDockButton({
  service,
  label,
  selected,
  ready,
  hint,
  panelId,
  onSelect,
}: ServiceDockButtonProps) {
  return (
    <button
      className="dk-b"
      type="button"
      role="tab"
      id={`dk-${service}`}
      data-svc={service}
      aria-selected={selected}
      aria-controls={panelId}
      aria-disabled={!ready}
      tabIndex={selected ? 0 : -1}
      title={ready ? label : `${label} は準備中です`}
      onClick={() => onSelect(service)}
    >
      <i aria-hidden="true" />
      {label}
      {hint && <span className="dk-k" aria-hidden="true">{hint}</span>}
    </button>
  );
}
