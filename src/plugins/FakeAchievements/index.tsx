/*
 * Fake Achievements – Unlock silly achievements.
 * "Edited a message 5 times", "Sent 'lol' at 3am", etc.
 * Add this plugin to your Navinecord source: src/userplugins/FakeAchievements/
 * Then rebuild the extension.
 */

import definePlugin from "@utils/types";

const editCountByMessageId = new Map<string, number>();
const unlockedAchievements = new Set<string>();

function showAchievement(title: string, message: string) {
    if (unlockedAchievements.has(title)) return;
    unlockedAchievements.add(title);
    try {
        const Toasts = require("@api/Toasts").default ?? require("@api/Toasts");
        Toasts.show({
            id: `achievement-${title.replace(/\s+/g, "-")}`,
            message: `${title} – ${message}`,
            type: 0, // SUCCESS / INFO
            icon: "🏆",
        });
    } catch {
        console.log(`[Navinecord] Fake Achievements – 🏆 ${title}: ${message}`);
    }
}

export default definePlugin({
    name: "Fake Achievements",
    description: "Unlock silly achievements like 'Edited a message 5 times' and \"Sent 'lol' at 3am\".",
    authors: [{ name: "Navinecord", id: 0n }],
    dependencies: ["MessageEventsAPI"],

    onBeforeMessageEdit(_channelId: string, msgOrId: { id?: string } | string) {
        const msgId = typeof msgOrId === "string" ? msgOrId : (msgOrId?.id ?? "");
        if (!msgId) return;
        const count = (editCountByMessageId.get(msgId) ?? 0) + 1;
        editCountByMessageId.set(msgId, count);
        if (count >= 5) {
            showAchievement("Edited a message 5 times", "You really couldn't get it right the first time.");
        }
    },

    onBeforeMessageSend(_channelId: string, message: { content: string }) {
        const content = (message?.content ?? "").trim().toLowerCase();
        const hour = new Date().getHours();
        if (content === "lol" && (hour === 3 || hour === 15)) {
            showAchievement("Sent 'lol' at 3am", "Nothing is that funny at 3am.");
        }
    },
});
