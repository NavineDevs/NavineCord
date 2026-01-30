/*
 * Navinecord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Command } from "@Navinecord/discord-types";
export { ApplicationCommandInputType, ApplicationCommandOptionType, ApplicationCommandType } from "@Navinecord/discord-types/enums";

export interface NavinecordCommand extends Command {
    isNavinecordCommand?: boolean;
}
