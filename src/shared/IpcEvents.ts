/*
 * Navinecord, a modification for Discord's desktop app
 * Copyright (c) 2023 Vendicated and contributors
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

export const enum IpcEvents {
    INIT_FILE_WATCHERS = "NavinecordInitFileWatchers",

    OPEN_QUICKCSS = "NavinecordOpenQuickCss",
    GET_QUICK_CSS = "NavinecordGetQuickCss",
    SET_QUICK_CSS = "NavinecordSetQuickCss",
    QUICK_CSS_UPDATE = "NavinecordQuickCssUpdate",

    GET_SETTINGS = "NavinecordGetSettings",
    SET_SETTINGS = "NavinecordSetSettings",

    GET_THEMES_LIST = "NavinecordGetThemesList",
    GET_THEME_DATA = "NavinecordGetThemeData",
    GET_THEME_SYSTEM_VALUES = "NavinecordGetThemeSystemValues",
    THEME_UPDATE = "NavinecordThemeUpdate",

    OPEN_EXTERNAL = "NavinecordOpenExternal",
    OPEN_THEMES_FOLDER = "NavinecordOpenThemesFolder",
    OPEN_SETTINGS_FOLDER = "NavinecordOpenSettingsFolder",

    GET_UPDATES = "NavinecordGetUpdates",
    GET_REPO = "NavinecordGetRepo",
    UPDATE = "NavinecordUpdate",
    BUILD = "NavinecordBuild",

    OPEN_MONACO_EDITOR = "NavinecordOpenMonacoEditor",
    GET_MONACO_THEME = "NavinecordGetMonacoTheme",

    GET_PLUGIN_IPC_METHOD_MAP = "NavinecordGetPluginIpcMethodMap",

    CSP_IS_DOMAIN_ALLOWED = "NavinecordCspIsDomainAllowed",
    CSP_REMOVE_OVERRIDE = "NavinecordCspRemoveOverride",
    CSP_REQUEST_ADD_OVERRIDE = "NavinecordCspRequestAddOverride",

    GET_RENDERER_CSS = "NavinecordGetRendererCss",
    RENDERER_CSS_UPDATE = "NavinecordRendererCssUpdate",
    PRELOAD_GET_RENDERER_JS = "NavinecordPreloadGetRendererJs",
}
