import {
  Accessibility,
  CircleDot,
  Footprints,
  Goal,
  LucideIcon,
  PersonStanding,
  ShipWheel,
  SportShoe,
  Sword,
  Target,
  Trophy,
  Volleyball,
  Waves,
} from 'lucide-react';
import { createElement } from 'react';

type SportBadgeProps = {
  sportName: string | null | undefined;
  className?: string;
};

const sportBadgeRules: Array<{ matches: string[]; icon: LucideIcon }> = [
  { matches: ['football', 'flag football'], icon: Goal },
  { matches: ['basketball'], icon: CircleDot },
  { matches: ['baseball', 'softball'], icon: CircleDot },
  { matches: ['soccer'], icon: CircleDot },
  { matches: ['hockey'], icon: CircleDot },
  { matches: ['tennis'], icon: CircleDot },
  { matches: ['volleyball'], icon: Volleyball },
  { matches: ['golf'], icon: Target },
  { matches: ['track', 'cross country', 'running'], icon: SportShoe },
  { matches: ['swimming', 'water polo'], icon: Waves },
  { matches: ['rowing'], icon: ShipWheel },
  { matches: ['lacrosse'], icon: Target },
  { matches: ['fencing'], icon: Sword },
  { matches: ['gymnastics'], icon: PersonStanding },
  { matches: ['wrestling'], icon: Accessibility },
  { matches: ['field hockey'], icon: Target },
  { matches: ['dance'], icon: PersonStanding },
  { matches: ['cheer'], icon: PersonStanding },
  { matches: ['bowling'], icon: CircleDot },
  { matches: ['archery'], icon: Target },
  { matches: ['climbing'], icon: Target },
  { matches: ['equestrian'], icon: Trophy },
  { matches: ['ski', 'snowboard'], icon: Footprints },
];

/** Selects a recognizable badge icon from a sport name, with a safe fallback. */
export function getSportBadgeIcon(sportName: string | null | undefined): LucideIcon {
  const normalized = sportName?.trim().toLowerCase() ?? '';
  return (
    sportBadgeRules.find(({ matches }) =>
      matches.some((match) => normalized.includes(match)),
    )?.icon ?? Trophy
  );
}

export default function SportBadge({ sportName, className = 'size-4' }: SportBadgeProps) {
  const Icon = getSportBadgeIcon(sportName);
  return createElement(Icon, {
    className,
    'aria-label': `${sportName || 'Sport'} badge`,
    role: 'img',
  });
}
