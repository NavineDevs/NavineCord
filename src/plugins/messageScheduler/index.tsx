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
import { MessageActions } from "@webpack/common";

const settings = definePluginSettings({
    scheduledMessages: {
        description: "Scheduled messages (JSON array)",
        type: OptionType.STRING,
        default: "[]",
        multiline: true
    }
});

export default definePlugin({
    name: "MessageScheduler",
    description: "Schedule messages to be sent at specific times",
    authors: [Devs.Ven],

    settings,

    start() {
        this.checkScheduledMessages();
        setInterval(() => this.checkScheduledMessages(), 60000); // Check every minute
    },

    checkScheduledMessages() {
        try {
            const scheduled = JSON.parse(settings.store.scheduledMessages || "[]");
            const now = Date.now();

            scheduled.forEach((msg: any) => {
                if (msg.timestamp && msg.timestamp <= now && !msg.sent) {
                    MessageActions.sendMessage(msg.channelId, {
                        content: msg.content
                    });
                    msg.sent = true;
                }
            });

            // Update settings with sent status
            settings.store.scheduledMessages = JSON.stringify(scheduled);
        } catch (e) {
            console.error("MessageScheduler error:", e);
        }
    }
});
