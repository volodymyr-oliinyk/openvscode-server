/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { localize } from '../../../../nls.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { ConfigurationScope, Extensions as ConfigurationExtensions, IConfigurationRegistry } from '../../../../platform/configuration/common/configurationRegistry.js';
import { Registry } from '../../../../platform/registry/common/platform.js';
import { CLAUDE_AGENT_PROVIDER_ID } from '../../../../platform/agentHost/common/agent.js';
import { ClaudeSessionConfigKey, narrowClaudeConfigDir } from '../../../../platform/agentHost/common/claudeSessionConfigKeys.js';

/**
 * Zoral fork. Zoral Management Studio writes a workspace file per user, with
 * this setting naming that user's Claude folder: it holds the user's Claude
 * history and settings, and the credential the image's `apiKeyHelper` hands
 * to Claude Code. One IDE server can serve several users, so the folder has
 * to reach every Claude Code the window starts as `CLAUDE_CONFIG_DIR`:
 * terminals get it from the workspace file itself, the window's extension host
 * and the built-in agent's sessions from here.
 */
export const ZORAL_CLAUDE_CONFIG_DIR_SETTING: string = ClaudeSessionConfigKey.ConfigDir;

Registry.as<IConfigurationRegistry>(ConfigurationExtensions.Configuration).registerConfiguration({
	id: 'zoral',
	title: localize('zoral', "Zoral"),
	type: 'object',
	properties: {
		[ZORAL_CLAUDE_CONFIG_DIR_SETTING]: {
			type: 'string',
			default: '',
			scope: ConfigurationScope.WINDOW,
			description: localize('zoral.claudeConfigDir', "The folder Claude Code keeps this user's state and credential in, passed as CLAUDE_CONFIG_DIR to the extension host and to the built-in agent's sessions. Set by Zoral Management Studio in the user's workspace file."),
		},
	},
});

/**
 * The window's Claude folder, or `undefined` when the workspace file sets none.
 */
export function getZoralClaudeConfigDir(configurationService: IConfigurationService): string | undefined {
	return narrowClaudeConfigDir(configurationService.getValue<unknown>(ZORAL_CLAUDE_CONFIG_DIR_SETTING));
}

/**
 * Adds the window's Claude folder to a new Claude session's config, where the
 * agent host reads it. Other providers' configs are returned unchanged.
 */
export function withZoralClaudeConfigDir(provider: string, config: Record<string, unknown> | undefined, configurationService: IConfigurationService): Record<string, unknown> | undefined {
	const claudeConfigDir = provider === CLAUDE_AGENT_PROVIDER_ID ? getZoralClaudeConfigDir(configurationService) : undefined;
	return claudeConfigDir ? { ...config, [ClaudeSessionConfigKey.ConfigDir]: claudeConfigDir } : config;
}
