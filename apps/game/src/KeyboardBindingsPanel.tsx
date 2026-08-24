import { useEffect, useState } from 'react';
import type { KeyboardMapping, ShotAction } from '@squash-gaming/input';

type BindingId =
  | 'movement.up'
  | 'movement.down'
  | 'movement.left'
  | 'movement.right'
  | 'shot.length'
  | 'shot.drop'
  | 'shot.lob'
  | 'shot.push'
  | 'focus';

interface KeyboardBindingsPanelProps {
  mapping: KeyboardMapping;
  onChange: (mapping: KeyboardMapping) => void;
  onReset: () => void;
}

interface BindingDefinition {
  id: BindingId;
  label: string;
  group: 'Déplacement' | 'Actions';
}

const BINDINGS: readonly BindingDefinition[] = [
  { id: 'movement.up', label: 'Avant', group: 'Déplacement' },
  { id: 'movement.down', label: 'Arrière', group: 'Déplacement' },
  { id: 'movement.left', label: 'Gauche', group: 'Déplacement' },
  { id: 'movement.right', label: 'Droite', group: 'Déplacement' },
  { id: 'focus', label: 'Focus', group: 'Actions' },
  { id: 'shot.length', label: 'Coup long', group: 'Actions' },
  { id: 'shot.drop', label: 'Coup bas', group: 'Actions' },
  { id: 'shot.lob', label: 'Lob', group: 'Actions' },
  { id: 'shot.push', label: 'Poussée', group: 'Actions' }
];

export function KeyboardBindingsPanel({ mapping, onChange, onReset }: KeyboardBindingsPanelProps) {
  const [capturing, setCapturing] = useState<BindingId | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!capturing) return undefined;

    const handleKeyDown = (event: KeyboardEvent) => {
      event.preventDefault();
      event.stopPropagation();
      const key = normalizeKey(event.key);
      if (key === 'Escape') {
        setCapturing(null);
        setError(null);
        return;
      }

      if (isBoundElsewhere(mapping, capturing, key)) {
        setError('Cette touche est déjà utilisée. Choisis-en une autre.');
        return;
      }

      onChange(withBinding(mapping, capturing, key));
      setCapturing(null);
      setError(null);
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [capturing, mapping, onChange]);

  return (
    <details className="bindings-card" data-testid="keyboard-bindings">
      <summary>Changer les touches</summary>
      <p className="bindings-help">Clique sur une action puis appuie sur la nouvelle touche.</p>
      {(['Déplacement', 'Actions'] as const).map((group) => (
        <div className="bindings-group" key={group}>
          <span className="theme-label">{group}</span>
          {BINDINGS.filter((binding) => binding.group === group).map((binding) => {
            const isCapturing = capturing === binding.id;
            return (
              <div className="binding-row" key={binding.id}>
                <span>{binding.label}</span>
                <button
                  type="button"
                  className={isCapturing ? 'binding-key is-capturing' : 'binding-key'}
                  data-testid={`binding-${binding.id.replace('.', '-')}`}
                  onClick={() => {
                    setCapturing(binding.id);
                    setError(null);
                  }}
                >
                  {isCapturing ? 'Appuie…' : formatKey(getBinding(mapping, binding.id))}
                </button>
              </div>
            );
          })}
        </div>
      ))}
      {error && <p className="bindings-error" role="alert">{error}</p>}
      <button type="button" className="bindings-reset" onClick={onReset} data-testid="bindings-reset">
        Restaurer les touches par défaut
      </button>
    </details>
  );
}

function getBinding(mapping: KeyboardMapping, id: BindingId): string | undefined {
  if (id === 'focus') return mapping.focus ?? undefined;
  const [group, action] = id.split('.') as ['movement' | 'shot', string];
  if (group === 'movement') return mapping.movement?.[action as keyof NonNullable<KeyboardMapping['movement']>];
  return Object.entries(mapping.shots).find(([, shot]) => shot === action)?.[0];
}

function withBinding(mapping: KeyboardMapping, id: BindingId, key: string): KeyboardMapping {
  const next: KeyboardMapping = {
    ...mapping,
    movement: mapping.movement ? { ...mapping.movement } : undefined,
    shots: { ...mapping.shots }
  };

  if (id === 'focus') {
    next.focus = key;
    return next;
  }

  const [group, action] = id.split('.') as ['movement' | 'shot', string];
  if (group === 'movement' && next.movement) {
    next.movement[action as keyof NonNullable<KeyboardMapping['movement']>] = key;
    return next;
  }

  const shot = action as ShotAction;
  Object.entries(next.shots).forEach(([existingCode, existingShot]) => {
    if (existingShot === shot) delete next.shots[existingCode];
  });
  next.shots[key] = shot;
  return next;
}

function isBoundElsewhere(mapping: KeyboardMapping, id: BindingId, key: string): boolean {
  return BINDINGS.some((binding) => binding.id !== id && getBinding(mapping, binding.id) === key);
}

function formatKey(key: string | undefined): string {
  if (!key) return '—';
  const labels: Record<string, string> = {
    ' ': 'Espace',
    Shift: 'Maj',
    ControlLeft: 'Ctrl gauche',
    ControlRight: 'Ctrl droite',
    Enter: 'Entrée',
    ArrowUp: '↑',
    ArrowDown: '↓',
    ArrowLeft: '←',
    ArrowRight: '→'
  };
  return labels[key] ?? (key.length === 1 ? key.toLocaleUpperCase() : key);
}

function normalizeKey(key: string): string {
  return key.length === 1 ? key.toLocaleLowerCase() : key;
}
