// lib/services/subscriptionService.ts - Subscription service availability (Game Pass, PS+, etc.)
import { SubscriptionService } from "@/types/game";

interface GamePassGame {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  categories?: string[];
  releaseDate?: string;
}

interface GamePassResponse {
  Products: GamePassGame[];
}

class SubscriptionServiceChecker {
  private readonly CACHE_DURATION = 1000 * 60 * 60; // 1 hour

  // Cached set of normalized titles currently on Game Pass.
  private gamePassTitles: Set<string> | null = null;
  private gamePassExpiry = 0;

  // Microsoft "sigl" catalog ids for the Game Pass "All games" lists
  // (console + PC). Unofficial endpoints — may change.
  private readonly GAMEPASS_SIGLS = [
    'f6f1f99f-9b49-4ccd-b3bf-4d9767a77f5e', // Console — All games
    'fdd9e2a7-0fee-49f6-ad69-4354098401ff', // PC — All games
  ];

  /**
   * Build (and cache) the real Game Pass catalog as a set of normalized titles.
   * Resolves sigl product IDs through Microsoft's displaycatalog API.
   * MUST run server-side. Fails safe: returns an empty set on any error so we
   * never show a false-positive badge.
   */
  private async loadGamePassCatalog(): Promise<Set<string>> {
    if (this.gamePassTitles && Date.now() < this.gamePassExpiry) {
      return this.gamePassTitles;
    }

    const productIds = new Set<string>();
    for (const sigl of this.GAMEPASS_SIGLS) {
      try {
        const res = await fetch(
          `https://catalog.gamepass.com/sigls/v2?id=${sigl}&language=en-us&market=US`,
          { next: { revalidate: 3600 } },
        );
        if (!res.ok) continue;
        const data = await res.json();
        if (Array.isArray(data)) {
          for (const item of data) {
            // sigl entries are product "bigIds" (12-char store ids); the first
            // element is list metadata without a valid id.
            if (typeof item?.id === 'string' && /^[0-9A-Za-z]{12}$/.test(item.id)) {
              productIds.add(item.id);
            }
          }
        }
      } catch {
        /* ignore — fail safe */
      }
    }

    const titles = new Set<string>();
    const ids = Array.from(productIds);
    for (let i = 0; i < ids.length; i += 100) {
      const batch = ids.slice(i, i + 100);
      try {
        const url = `https://displaycatalog.mp.microsoft.com/v7.0/products?bigIds=${batch.join(',')}&market=US&languages=en-us&fieldsTemplate=Details`;
        const res = await fetch(url, {
          headers: { 'MS-CV': 'DGU1mcuYo0WMMp+F.1' },
          next: { revalidate: 3600 },
        });
        if (!res.ok) continue;
        const data = await res.json();
        for (const p of data?.Products ?? []) {
          const t = p?.LocalizedProperties?.[0]?.ProductTitle;
          if (t) titles.add(this.normalizeTitle(t));
        }
      } catch {
        /* ignore — fail safe */
      }
    }

    this.gamePassTitles = titles;
    this.gamePassExpiry = Date.now() + this.CACHE_DURATION;
    return titles;
  }

  /**
   * Real check: is this exact title in the current Game Pass catalog?
   * Returns false on any failure (never a false positive).
   */
  async checkGamePass(gameTitle: string): Promise<boolean> {
    try {
      const titles = await this.loadGamePassCatalog();
      if (titles.size === 0) return false;
      return titles.has(this.normalizeTitle(gameTitle));
    } catch {
      return false;
    }
  }

  /**
   * Subscription services a game is confirmed available on.
   * Only Game Pass has a usable public catalog; PS+/EA Play/Ubisoft+ have no
   * reliable public API, so we do not guess (no fabricated availability).
   */
  async checkAllServices(gameTitle: string): Promise<SubscriptionService[]> {
    const available: SubscriptionService[] = [];
    if (await this.checkGamePass(gameTitle)) available.push('game_pass');
    return available;
  }

  /**
   * Get subscription service display info
   */
  getServiceInfo(service: SubscriptionService): {
    name: string;
    color: string;
    icon: string;
  } {
    const serviceInfo: Record<SubscriptionService, { name: string; color: string; icon: string }> = {
      'ps_plus': {
        name: 'PS Plus',
        color: 'bg-blue-600',
        icon: '/icons/psplus.svg'
      },
      'ps_plus_extra': {
        name: 'PS Plus Extra',
        color: 'bg-blue-700',
        icon: '/icons/psplus.svg'
      },
      'ps_plus_premium': {
        name: 'PS Plus Premium',
        color: 'bg-blue-800',
        icon: '/icons/psplus.svg'
      },
      'game_pass': {
        name: 'Game Pass',
        color: 'bg-green-600',
        icon: '/icons/gamepass.svg'
      },
      'game_pass_ultimate': {
        name: 'Game Pass Ultimate',
        color: 'bg-green-700',
        icon: '/icons/gamepass.svg'
      },
      'ea_play': {
        name: 'EA Play',
        color: 'bg-orange-600',
        icon: '/icons/eaplay.svg'
      },
      'ubisoft_plus': {
        name: 'Ubisoft+',
        color: 'bg-blue-500',
        icon: '/icons/ubisoftplus.svg'
      },
      'nintendo_online': {
        name: 'Nintendo Online',
        color: 'bg-red-600',
        icon: '/icons/nintendo.svg'
      }
    };

    return serviceInfo[service] || { name: service, color: 'bg-gray-600', icon: '' };
  }

  /**
   * Normalize game title for comparison
   */
  private normalizeTitle(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .replace(/edition|goty|deluxe|ultimate|complete|definitive|remaster|remake/g, '');
  }
}

// Export singleton instance
export const subscriptionService = new SubscriptionServiceChecker();
