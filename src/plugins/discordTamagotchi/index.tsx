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
import { FluxDispatcher, UserStore } from "@webpack/common";

const logger = new Logger("DiscordTamagotchi");

interface TamagotchiState {
    health: number;
    hunger: number;
    happiness: number;
    lastFed: number;
    lastActivity: number;
    isAlive: boolean;
    age: number; // in days
    name: string;
}

const DEFAULT_STATE: TamagotchiState = {
    health: 100,
    hunger: 50,
    happiness: 50,
    lastFed: Date.now(),
    lastActivity: Date.now(),
    isAlive: true,
    age: 0,
    name: "Tamagotchi"
};

const settings = definePluginSettings({
    enabled: {
        description: "Enable Discord Tamagotchi",
        type: OptionType.BOOLEAN,
        default: true
    },
    petName: {
        description: "Your pet's name",
        type: OptionType.STRING,
        default: "Tamagotchi"
    },
    inactivityTimeout: {
        description: "Minutes of inactivity before pet dies",
        type: OptionType.NUMBER,
        default: 60
    },
    hungerDecayRate: {
        description: "Hunger decrease per minute",
        type: OptionType.NUMBER,
        default: 1
    },
    healthDecayRate: {
        description: "Health decrease per minute when hungry",
        type: OptionType.NUMBER,
        default: 0.5
    }
});

function getState(): TamagotchiState {
    const stored = localStorage.getItem("navinecord_tamagotchi_state");
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch (e) {
            logger.error("Failed to parse tamagotchi state", e);
        }
    }
    return { ...DEFAULT_STATE, name: settings.store.petName };
}

function saveState(state: TamagotchiState) {
    localStorage.setItem("navinecord_tamagotchi_state", JSON.stringify(state));
}

function updateTamagotchi() {
    if (!settings.store.enabled) return;

    const state = getState();
    if (!state.isAlive) return;

    const now = Date.now();
    const minutesSinceActivity = (now - state.lastActivity) / (1000 * 60);
    const minutesSinceFed = (now - state.lastFed) / (1000 * 60);

    // Update hunger
    state.hunger = Math.max(0, state.hunger - (settings.store.hungerDecayRate * minutesSinceFed));
    
    // Update health if hungry
    if (state.hunger <= 0) {
        state.health = Math.max(0, state.health - (settings.store.healthDecayRate * minutesSinceActivity));
    }

    // Update happiness based on activity
    if (minutesSinceActivity < 5) {
        state.happiness = Math.min(100, state.happiness + 0.5);
    } else {
        state.happiness = Math.max(0, state.happiness - 0.2);
    }

    // Check if pet died from inactivity
    if (minutesSinceActivity >= settings.store.inactivityTimeout) {
        state.isAlive = false;
        state.health = 0;
        showNotification({
            title: "💀 Your Tamagotchi Died!",
            body: `${state.name} died from inactivity. Restart the plugin to revive them.`,
            color: "var(--red-360)",
            permanent: true
        });
    } else if (state.health <= 0) {
        state.isAlive = false;
        showNotification({
            title: "💀 Your Tamagotchi Died!",
            body: `${state.name} died from starvation. Restart the plugin to revive them.`,
            color: "var(--red-360)",
            permanent: true
        });
    }

    // Update age
    const daysSinceBirth = Math.floor((now - (state.lastFed - (state.age * 24 * 60 * 60 * 1000))) / (24 * 60 * 60 * 1000));
    state.age = daysSinceBirth;

    saveState(state);
}

function feedTamagotchi() {
    if (!settings.store.enabled) return;

    const state = getState();
    if (!state.isAlive) {
        // Revive the pet
        Object.assign(state, DEFAULT_STATE);
        state.name = settings.store.petName;
        state.isAlive = true;
        showNotification({
            title: "✨ Tamagotchi Revived!",
            body: `${state.name} has been revived!`,
            color: "var(--green-360)"
        });
    } else {
        state.hunger = Math.min(100, state.hunger + 20);
        state.health = Math.min(100, state.health + 5);
        state.happiness = Math.min(100, state.happiness + 10);
        state.lastFed = Date.now();
        
        if (state.hunger >= 100) {
            showNotification({
                title: "🍽️ Tamagotchi Fed!",
                body: `${state.name} is full and happy!`,
                color: "var(--green-360)"
            });
        }
    }

    state.lastActivity = Date.now();
    saveState(state);
}

export default definePlugin({
    name: "DiscordTamagotchi",
    description: "Feed it with messages, it dies if you go inactive",
    authors: [Devs.Ven],

    settings,

    flux: {
        MESSAGE_CREATE: (message: any) => {
            if (!settings.store.enabled) return;
            // Only feed on messages sent by the current user
            if (message.author?.id === UserStore.getCurrentUser()?.id) {
                feedTamagotchi();
            }
        }
    },

    start() {
        if (!settings.store.enabled) return;

        // Initialize state if needed
        const state = getState();
        if (!state.name || state.name !== settings.store.petName) {
            state.name = settings.store.petName;
            saveState(state);
        }

        // Update tamagotchi every minute
        this.updateInterval = setInterval(() => {
            updateTamagotchi();
        }, 60000);

        // Initial update
        updateTamagotchi();

        // Show welcome notification
        const state = getState();
        if (state.isAlive) {
            showNotification({
                title: "🐾 Tamagotchi Active!",
                body: `${state.name} is alive! Send messages to feed them.`,
                color: "var(--blue-360)"
            });
        }
    },

    stop() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
    }
});
