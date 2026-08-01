'use client'
import { IGDBGame, SubscriptionService, PLATFORM_IDS } from "@/types/game"
import { Badge } from "./ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip"
import SafeIcon from "@/components/SafeIcon"
import { Monitor, Gamepad, Gamepad2 } from "lucide-react"
import { useQuery } from "@tanstack/react-query"

interface GameProvidersBlockProps {
  game: IGDBGame;
  showSubscriptions?: boolean;
}

// Platform icons and colors
const platformConfig: Record<string, { icon: any; color: string; label: string }> = {
  'PC': { icon: Monitor, color: 'bg-gray-700', label: 'PC' },
  'PlayStation': { icon: Gamepad, color: 'bg-blue-600', label: 'PlayStation' },
  'Xbox': { icon: Gamepad2, color: 'bg-green-600', label: 'Xbox' },
  'Nintendo': { icon: Gamepad, color: 'bg-red-600', label: 'Nintendo' },
};

// Map platform IDs to categories
function getPlatformCategory(platformId: number): string | null {
  // PlayStation
  if ([PLATFORM_IDS.PS5, PLATFORM_IDS.PS4, PLATFORM_IDS.PS3, PLATFORM_IDS.PS_VITA, PLATFORM_IDS.PSP].includes(platformId as any)) {
    return 'PlayStation';
  }
  // Xbox
  if ([PLATFORM_IDS.XBOX_SERIES, PLATFORM_IDS.XBOX_ONE, PLATFORM_IDS.XBOX_360].includes(platformId as any)) {
    return 'Xbox';
  }
  // Nintendo
  if ([PLATFORM_IDS.SWITCH, PLATFORM_IDS.WII_U, PLATFORM_IDS.WII, PLATFORM_IDS.N3DS].includes(platformId as any)) {
    return 'Nintendo';
  }
  // PC
  if ([PLATFORM_IDS.PC, PLATFORM_IDS.MAC, PLATFORM_IDS.LINUX].includes(platformId as any)) {
    return 'PC';
  }
  return null;
}

// Subscription badge colors
const subscriptionColors: Record<SubscriptionService, string> = {
  'ps_plus': 'bg-blue-600 hover:bg-blue-700',
  'ps_plus_extra': 'bg-blue-700 hover:bg-blue-800',
  'ps_plus_premium': 'bg-blue-800 hover:bg-blue-900',
  'game_pass': 'bg-green-600 hover:bg-green-700',
  'game_pass_ultimate': 'bg-green-700 hover:bg-green-800',
  'ea_play': 'bg-orange-600 hover:bg-orange-700',
  'ubisoft_plus': 'bg-purple-600 hover:bg-purple-700',
  'nintendo_online': 'bg-red-600 hover:bg-red-700',
};

const subscriptionLabels: Record<SubscriptionService, string> = {
  'ps_plus': 'PS+',
  'ps_plus_extra': 'PS+ Extra',
  'ps_plus_premium': 'PS+ Premium',
  'game_pass': 'Game Pass',
  'game_pass_ultimate': 'GP Ultimate',
  'ea_play': 'EA Play',
  'ubisoft_plus': 'Ubisoft+',
  'nintendo_online': 'NSO',
};

const GameProvidersBlock = ({ game, showSubscriptions = true }: GameProvidersBlockProps) => {
  // Get unique platform categories (real, from IGDB)
  const platformCategories = new Set<string>();
  game.platforms?.forEach(platform => {
    const category = getPlatformCategory(platform.id);
    if (category) {
      platformCategories.add(category);
    }
  });

  // Real Game Pass availability via Microsoft's catalog (server-side, cached).
  // Only Game Pass has a usable public catalog — we never guess other services.
  const { data: gamePass } = useQuery({
    queryKey: ['gamepass', game.name],
    enabled: showSubscriptions && !!game.name,
    staleTime: 1000 * 60 * 60,
    queryFn: async () => {
      const r = await fetch(`/api/games/gamepass?title=${encodeURIComponent(game.name)}`);
      if (!r.ok) return { available: false };
      return r.json() as Promise<{ available: boolean }>;
    },
  });
  const subscriptions: SubscriptionService[] = gamePass?.available ? ['game_pass'] : [];

  if (platformCategories.size === 0 && subscriptions.length === 0) {
    return (
      <div className="flex items-center justify-center gap-2 p-2 bg-muted/20 rounded-lg border border-border/30">
        <span className="text-xs text-muted-foreground">No platform info</span>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex flex-wrap items-center gap-1.5 p-2 bg-muted/20 rounded-lg border border-border/30">
        {/* Platform badges */}
        {Array.from(platformCategories).map(category => {
          const config = platformConfig[category];
          if (!config) return null;

          return (
            <Tooltip key={category}>
              <TooltipTrigger>
                <Badge
                  className={`${config.color} text-white text-xs px-2 py-0.5 cursor-default`}
                >
                  <SafeIcon icon={config.icon} className="h-3 w-3 mr-1" size={12} />
                  {config.label}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Available on {config.label}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}

        {/* Subscription badges */}
        {subscriptions.map(sub => (
          <Tooltip key={sub}>
            <TooltipTrigger>
              <Badge
                className={`${subscriptionColors[sub]} text-white text-xs px-2 py-0.5 cursor-default`}
              >
                {subscriptionLabels[sub]}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>Available on {subscriptionLabels[sub]}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
};

export default GameProvidersBlock;
