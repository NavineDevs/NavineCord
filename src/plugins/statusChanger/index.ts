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
import { Devs } from "@utils/constants";
import definePlugin, { OptionType } from "@utils/types";
import { UserSettingsActionCreators } from "@webpack/common";

const settings = definePluginSettings({
    customStatus: {
        description: "Custom status text",
        type: OptionType.STRING,
        default: "Using Navinecord!"
    },
    autoChange: {
        description: "Automatically change status",
        type: OptionType.BOOLEAN,
        default: false
    },
    changeInterval: {
        description: "Change interval (minutes)",
        type: OptionType.NUMBER,
        default: 30
    }
});

export default definePlugin({
    name: "StatusChanger",
    description: "Automatically change your Discord status",
    authors: [Devs.Ven],

    settings,

    start() {
        if (settings.store.autoChange) {
            this.updateStatus();
            setInterval(() => this.updateStatus(), settings.store.changeInterval * 60 * 1000);
        }
    },

    updateStatus() {
        UserSettingsActionCreators.updateLocalSettings({
            status: {
                customStatus: {
                    text: settings.store.customStatus
                }
            }
        });
    }
});
