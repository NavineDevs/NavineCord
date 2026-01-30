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
    autoReact: {
        description: "Automatically react to messages with emojis",
        type: OptionType.BOOLEAN,
        default: false
    },
    emojiList: {
        description: "Comma-separated list of emojis to use",
        type: OptionType.STRING,
        default: "👍,❤️,😂"
    }
});

export default definePlugin({
    name: "EmojiReactions",
    description: "Automatically react to messages with custom emojis",
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
        if (!settings.store.autoReact) return;
        if (message.author?.bot) return;
        
        const emojis = settings.store.emojiList.split(",").map(e => e.trim()).filter(Boolean);
        emojis.forEach(emoji => {
            setTimeout(() => {
                MessageActions.addReaction(message.channel_id, message.id, emoji);
            }, 500);
        });
    }
});
