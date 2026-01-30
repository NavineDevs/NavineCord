/*
 * Discord Tamagotchi – Feed it with messages, it dies if you go inactive.
 * Add this plugin to your Navinecord source: src/userplugins/DiscordTamagotchi/
 * Then rebuild the extension.
 */

import { definePluginSettings } from "@api/Settings";
import definePlugin, { OptionType } from "@utils/types";

const settings = definePluginSettings({
    inactivityMinutes: {
        type: OptionType.NUMBER,
        description: "Minutes without sending a message before the Tamagotchi dies",
        default: 60,
    },
    showInChatBar: {
        type: OptionType.BOOLEAN,
        description: "Show Tamagotchi status in chat bar",
        default: true,
    },
});

let lastFedAt = Date.now();
let isDead = false;
let intervalId: ReturnType<typeof setInterval> | null = null;

function feed() {
    if (isDead) return;
    lastFedAt = Date.now();
}

function checkInactivity() {
    const mins = settings.store.inactivityMinutes ?? 60;
    const limit = mins * 60 * 1000;
    if (!isDead && Date.now() - lastFedAt > limit) {
        isDead = true;
        try {
            const Toasts = require("@api/Toasts").default ?? require("@api/Toasts");
            Toasts.show({
                id: "tamagotchi-died",
                message: "Your Tamagotchi died from inactivity. Send a message to revive it!",
                type: 2, // FAILURE
            });
        } catch {
            console.warn("[Navinecord] Discord Tamagotchi died (inactivity). Send a message to revive.");
        }
    }
}

export default definePlugin({
    name: "Discord Tamagotchi",
    description: "Feed it with messages, it dies if you go inactive.",
    authors: [{ name: "Navinecord", id: 0n }],
    dependencies: ["MessageEventsAPI"],
    settings,

    start() {
        lastFedAt = Date.now();
        isDead = false;
        intervalId = setInterval(checkInactivity, 60 * 1000);
    },

    stop() {
        if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
        }
    },

    onBeforeMessageSend(_channelId: string, message: { content: string }) {
        feed();
        if (isDead) {
            isDead = false;
            try {
                const Toasts = require("@api/Toasts").default ?? require("@api/Toasts");
                Toasts.show({
                    id: "tamagotchi-revived",
                    message: "Your Tamagotchi was revived!",
                    type: 1, // SUCCESS
                });
            } catch {
                // ignore
            }
        }
    },

    getTamagotchiStatus(): { alive: boolean; lastFed: number } {
        return { alive: !isDead, lastFed: lastFedAt };
    },

    renderChatBarButton() {
        if (!settings.store.showInChatBar) return null;
        const status = this.getTamagotchiStatus();
        const mins = ((Date.now() - status.lastFed) / 60000) | 0;
        return (
            <button
                onClick={() => {
                    try {
                        const Toasts = require("@api/Toasts").default ?? require("@api/Toasts");
                        Toasts.show({
                            id: "tamagotchi-status",
                            message: status.alive
                                ? `Tamagotchi is alive! Last fed ${mins}m ago.`
                                : "Tamagotchi is dead. Send a message to revive.",
                            type: status.alive ? 0 : 2,
                        });
                    } catch {
                        // ignore
                    }
                }}
                title={status.alive ? `Alive – fed ${mins}m ago` : "Dead – send a message to revive"}
                style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}
            >
                {status.alive ? "🐣" : "💀"}
            </button>
        );
    },
});
