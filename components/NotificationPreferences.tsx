'use client'
import { useEffect, useState } from "react";
import { account } from "@/lib/appwrite";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import type { NotificationPrefs } from "@/hooks/User";

const DEFAULTS: NotificationPrefs = {
    plexRequestUpdates: true,
    newRecommendations: true,
    watchlistReminders: false,
};

const OPTIONS: { key: keyof NotificationPrefs; label: string; desc: string }[] = [
    { key: 'plexRequestUpdates', label: 'Plex request updates', desc: 'When a requested title becomes available.' },
    { key: 'newRecommendations', label: 'New recommendations', desc: 'Fresh picks based on your watchlist.' },
    { key: 'watchlistReminders', label: 'Watchlist reminders', desc: 'Occasional nudges about unwatched items.' },
];

export default function NotificationPreferences() {
    const [prefs, setPrefs] = useState<NotificationPrefs>(DEFAULTS);
    const [loaded, setLoaded] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        account.getPrefs()
            .then((p: any) => setPrefs({ ...DEFAULTS, ...(p.notifications ?? {}) }))
            .catch(() => { /* keep defaults */ })
            .finally(() => setLoaded(true));
    }, []);

    const update = async (key: keyof NotificationPrefs, value: boolean) => {
        const next = { ...prefs, [key]: value };
        setPrefs(next); // optimistic
        setSaving(true);
        try {
            const current = await account.getPrefs();
            await account.updatePrefs({ ...current, notifications: next });
            toast.success('Preferences saved');
        } catch (e) {
            setPrefs(prefs); // rollback
            toast.error("Couldn't save preferences");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-4">
            {OPTIONS.map((opt) => (
                <div key={opt.key} className="flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                        <Label htmlFor={`notif-${opt.key}`} className="text-sm font-medium">{opt.label}</Label>
                        <p className="text-xs text-muted-foreground">{opt.desc}</p>
                    </div>
                    <Switch
                        id={`notif-${opt.key}`}
                        checked={prefs[opt.key]}
                        disabled={!loaded || saving}
                        onCheckedChange={(v) => update(opt.key, v)}
                    />
                </div>
            ))}
        </div>
    );
}
