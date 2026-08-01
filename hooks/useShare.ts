'use client'
import { toast } from "sonner";

interface ShareArgs {
    title?: string;
    text?: string;
    /** Absolute URL, or a path beginning with "/" (origin is prepended). */
    url: string;
}

/**
 * Returns a share() function that uses the native Web Share sheet when available
 * and falls back to copying the link to the clipboard.
 */
export function useShare() {
    return async function share({ title, text, url }: ShareArgs) {
        const absolute = url.startsWith('http')
            ? url
            : `${window.location.origin}${url}`;

        // Native share sheet (mobile / supported browsers)
        if (typeof navigator !== 'undefined' && navigator.share) {
            try {
                await navigator.share({ title, text, url: absolute });
                return;
            } catch (e: any) {
                if (e?.name === 'AbortError') return; // user dismissed the sheet
                // otherwise fall through to clipboard
            }
        }

        // Clipboard fallback
        try {
            await navigator.clipboard.writeText(absolute);
            toast.success('Link copied to clipboard');
        } catch {
            toast.error("Couldn't share this link");
        }
    };
}
