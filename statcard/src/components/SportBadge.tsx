import {
  Accessibility,
  PersonStanding,
  Trophy,
} from 'lucide-react';
import {
  GiAmericanFootballBall,
  GiArcheryTarget,
  GiBaseballGlove,
  GiBasketballBall,
  GiBoxingGlove,
  GiBowlingPin,
  GiCanoe,
  GiCricket,
  GiFencer,
  GiGolfFlag,
  GiHockey,
  GiIceSkate,
  GiMountainClimbing,
  GiPingPongBat,
  GiRugbyConversion,
  GiRunningShoe,
  GiSkiBoot,
  GiSoccerBall,
  GiSwimfins,
  GiShuttlecock,
  GiTennisRacket,
  GiVolleyballBall,
  GiWaterPolo,
} from 'react-icons/gi';
import type { IconType } from 'react-icons';
import { createElement } from 'react';

type SportBadgeProps = {
  sportName: string | null | undefined;
  className?: string;
};

const sportBadgeRules: Array<{ matches: string[]; icon: IconType }> = [
  { matches: ['football', 'flag football'], icon: GiAmericanFootballBall },
  { matches: ['basketball'], icon: GiBasketballBall },
  { matches: ['baseball', 'softball'], icon: GiBaseballGlove },
  { matches: ['soccer'], icon: GiSoccerBall },
  { matches: ['field hockey', 'ice hockey', 'hockey'], icon: GiHockey },
  { matches: ['tennis'], icon: GiTennisRacket },
  { matches: ['volleyball'], icon: GiVolleyballBall },
  { matches: ['golf'], icon: GiGolfFlag },
  { matches: ['track', 'cross country', 'running'], icon: GiRunningShoe },
  { matches: ['swimming'], icon: GiSwimfins },
  { matches: ['water polo'], icon: GiWaterPolo },
  { matches: ['rowing'], icon: GiCanoe },
  { matches: ['lacrosse'], icon: GiHockey },
  { matches: ['fencing'], icon: GiFencer },
  { matches: ['gymnastics'], icon: PersonStanding },
  { matches: ['wrestling'], icon: Accessibility },
  { matches: ['rugby'], icon: GiRugbyConversion },
  { matches: ['cricket'], icon: GiCricket },
  { matches: ['boxing'], icon: GiBoxingGlove },
  { matches: ['badminton'], icon: GiShuttlecock },
  { matches: ['table tennis', 'ping pong'], icon: GiPingPongBat },
  { matches: ['bowling'], icon: GiBowlingPin },
  { matches: ['ski', 'snowboard'], icon: GiSkiBoot },
  { matches: ['skating'], icon: GiIceSkate },
  { matches: ['climbing'], icon: GiMountainClimbing },
  { matches: ['dance'], icon: PersonStanding },
  { matches: ['cheer'], icon: PersonStanding },
  { matches: ['archery'], icon: GiArcheryTarget },
  { matches: ['equestrian'], icon: Trophy },
];

/** Selects a recognizable badge icon from a sport name, with a safe fallback. */
export function getSportBadgeIcon(sportName: string | null | undefined): IconType {
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
