/*
 * Navinecord, a modification for Discord's desktop app
 * Copyright (c) 2024 Vendicated and contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { definePluginSettings } from "@api/Settings";
import { showNotification } from "@api/Notifications";
import { Devs } from "@utils/constants";
import { Logger } from "@utils/Logger";
import definePlugin, { OptionType } from "@utils/types";
import { UserStore } from "@webpack/common";

const logger = new Logger("FakeAchievements");

interface Achievement {
    id: string;
    title: string;
    description: string;
    unlocked: boolean;
    unlockedAt?: number;
}

interface AchievementStats {
    messageEdits: Record<string, number>; // messageId -> edit count
    messagesAt3am: number;
    lolMessages: number;
    achievements: Achievement[];
}

const ACHIEVEMENTS: Achievement[] = [
    {
        id: "edit_5_times",
        title: "Editor Extraordinaire",
        description: "Edited a message 5 times",
        unlocked: false
    },
    {
        id: "lol_at_3am",
        title: "Night Owl",
        description: "Sent 'lol' at 3am",
        unlocked: false
    }
];

function getStats(): AchievementStats {
    const stored = localStorage.getItem("navinecord_fake_achievements");
    if (stored) {
        try {
            const parsed = JSON.parse(stored);
            // Ensure all achievements exist
            parsed.achievements = ACHIEVEMENTS.map(ach => {
                const existing = parsed.achievements?.find((a: Achievement) => a.id === ach.id);
                return existing || ach;
            });
            return parsed;
        } catch (e) {
            logger.error("Failed to parse achievement stats", e);
        }
    }
    return {
        messageEdits: {},
        messagesAt3am: 0,
        lolMessages: 0,
        achievements: ACHIEVEMENTS.map(a => ({ ...a }))
    };
}

function saveStats(stats: AchievementStats) {
    localStorage.setItem("navinecord_fake_achievements", JSON.stringify(stats));
}

function unlockAchievement(achievementId: string, stats: AchievementStats) {
    const achievement = stats.achievements.find(a => a.id === achievementId);
    if (!achievement || achievement.unlocked) return false;

    achievement.unlocked = true;
    achievement.unlockedAt = Date.now();
    saveStats(stats);

    showNotification({
        title: `🏆 Achievement Unlocked!`,
        body: `${achievement.title}\n${achievement.description}`,
        color: "var(--yellow-360)",
        icon: "🏆"
    });

    return true;
}

const settings = definePluginSettings({
    enabled: {
        description: "Enable Fake Achievements",
        type: OptionType.BOOLEAN,
        default: true
    },
    showNotifications: {
        description: "Show achievement notifications",
        type: OptionType.BOOLEAN,
        default: true
    }
});

export default definePlugin({
    name: "FakeAchievements",
    description: "Unlock fake achievements for various Discord activities",
    authors: [Devs.Ven],

    settings,

    flux: {
        MESSAGE_CREATE: (message: any) => {
            if (!settings.store.enabled || !settings.store.showNotifications) return;
            if (message.author?.id !== UserStore.getCurrentUser()?.id) return;

            const stats = getStats();
            const now = new Date();
            const hour = now.getHours();

            // Check for "lol at 3am" achievement
            if (hour === 3 && message.content?.toLowerCase().includes("lol")) {
                stats.lolMessages++;
                saveStats(stats);
                unlockAchievement("lol_at_3am", stats);
            }
        },

        MESSAGE_UPDATE: (message: any) => {
            if (!settings.store.enabled || !settings.store.showNotifications) return;
            if (message.author?.id !== UserStore.getCurrentUser()?.id) return;
            // Only count actual edits (messages with edited_timestamp)
            if (!message.edited_timestamp) return;

            const stats = getStats();
            const messageId = message.id;

            // Track message edits
            if (!stats.messageEdits[messageId]) {
                stats.messageEdits[messageId] = 0;
            }
            stats.messageEdits[messageId]++;

            // Check for "edit 5 times" achievement
            if (stats.messageEdits[messageId] >= 5) {
                unlockAchievement("edit_5_times", stats);
            }

            saveStats(stats);
        }
    },


    start() {
        if (!settings.store.enabled) return;

        // Initialize stats
        const stats = getStats();
        saveStats(stats);

        logger.info("Fake Achievements enabled");
    }
});
