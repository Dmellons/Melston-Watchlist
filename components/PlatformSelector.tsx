'use client'
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import SafeIcon from "@/components/SafeIcon"
import { Monitor, Gamepad2, Check } from "lucide-react"
import { GamePlatform } from "@/types/game"

interface PlatformSelectorProps {
  selectedPlatforms: GamePlatform[];
  onPlatformChange: (platforms: GamePlatform[]) => void;
  compact?: boolean;
  disabled?: boolean;
}

const PLATFORMS: { id: GamePlatform; label: string; color: string }[] = [
  { id: 'steam', label: 'Steam', color: 'bg-slate-600' },
  { id: 'playstation', label: 'PlayStation', color: 'bg-blue-600' },
  { id: 'xbox', label: 'Xbox', color: 'bg-green-600' },
  { id: 'nintendo', label: 'Nintendo', color: 'bg-red-600' },
  { id: 'pc', label: 'PC (Other)', color: 'bg-gray-600' },
  { id: 'physical', label: 'Physical Disc', color: 'bg-amber-600' },
];

export function PlatformSelector({
  selectedPlatforms,
  onPlatformChange,
  compact = false,
  disabled = false
}: PlatformSelectorProps) {
  const togglePlatform = (platform: GamePlatform) => {
    if (disabled) return;

    if (selectedPlatforms.includes(platform)) {
      onPlatformChange(selectedPlatforms.filter(p => p !== platform));
    } else {
      onPlatformChange([...selectedPlatforms, platform]);
    }
  };

  if (compact) {
    return (
      <div className="flex flex-wrap gap-1.5">
        {PLATFORMS.map(platform => {
          const isSelected = selectedPlatforms.includes(platform.id);
          return (
            <Badge
              key={platform.id}
              variant={isSelected ? "default" : "outline"}
              className={`
                cursor-pointer transition-all text-xs
                ${isSelected ? `${platform.color} text-white border-transparent` : 'hover:bg-muted'}
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              onClick={() => togglePlatform(platform.id)}
            >
              {isSelected && <SafeIcon icon={Check} className="h-3 w-3 mr-1" size={12} />}
              {platform.label}
            </Badge>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {PLATFORMS.map(platform => {
        const isSelected = selectedPlatforms.includes(platform.id);
        return (
          <div
            key={platform.id}
            className={`
              flex items-center space-x-3 p-3 rounded-lg border transition-all cursor-pointer
              ${isSelected
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50 hover:bg-muted/50'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            onClick={() => togglePlatform(platform.id)}
          >
            <Checkbox
              id={platform.id}
              checked={isSelected}
              disabled={disabled}
              onCheckedChange={() => togglePlatform(platform.id)}
              className="pointer-events-none"
            />
            <div className="flex items-center gap-2 flex-1">
              <div className={`w-2 h-2 rounded-full ${platform.color}`} />
              <Label
                htmlFor={platform.id}
                className="text-sm font-medium cursor-pointer"
              >
                {platform.label}
              </Label>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Display-only component for showing owned platforms
export function OwnedPlatformsBadges({
  platforms,
  className = ""
}: {
  platforms: GamePlatform[];
  className?: string;
}) {
  if (!platforms || platforms.length === 0) return null;

  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {platforms.map(platformId => {
        const platform = PLATFORMS.find(p => p.id === platformId);
        if (!platform) return null;

        return (
          <Badge
            key={platformId}
            className={`${platform.color} text-white text-xs`}
          >
            <SafeIcon icon={Check} className="h-3 w-3 mr-1" size={12} />
            {platform.label}
          </Badge>
        );
      })}
    </div>
  );
}

export default PlatformSelector;
