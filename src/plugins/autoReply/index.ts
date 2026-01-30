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
    autoReplyEnabled: {
        description: "Enable automatic replies",
        type: OptionType.BOOLEAN,
        default: true
    },
    replyMessage: {
        description: "Message to automatically reply with",
        type: OptionType.STRING,
        default: "Thanks for your message! I'll get back to you soon."
    },
    replyDelay: {
        description: "Delay before sending reply (seconds)",
        type: OptionType.NUMBER,
        default: 2
    }
});

export default definePlugin({
    name: "AutoReply",
    description: "Automatically reply to DMs with a custom message",
    authors: [Devs.Ven],

    settings,

    patches: [
        {
            find: "MESSAGE_CREATE",
            replacement: {
                match: /MESSAGE_CREATE/,
                replace: "$&$self.handleMessage"
            }
        }
    ],

    handleMessage(message: any) {
        if (!settings.store.autoReplyEnabled) return;
        if (message.author?.bot) return;
        if (!message.guild_id) { // DM
            setTimeout(() => {
                MessageActions.sendMessage(message.channel_id, {
                    content: settings.store.replyMessage
                });
            }, settings.store.replyDelay * 1000);
        }
    }
});
