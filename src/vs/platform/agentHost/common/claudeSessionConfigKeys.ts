/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

/**
 * Well-known session-config keys advertised by the agent-host Claude
 * provider in its `resolveSessionConfig` schema.
 *
 * Claude collapses the platform's two-axis approval model
 * (`autoApprove` × `mode`) onto a single `permissionMode` axis matching
 * the Claude SDK's native `PermissionMode` (see
 * `@anthropic-ai/claude-agent-sdk` typings, `sdk.d.ts:1560`). The five
 * values mirror the SDK enum values that VS Code exposes, excluding
 * `dontAsk`, so that the value flowing back into `query({ permissionMode })`
 * requires no translation layer.
 *
 * The platform `Permissions` key (allow/deny tool lists) is reused
 * unchanged from `platformSessionSchema` because the Claude SDK accepts
 * `allowedTools` / `disallowedTools` natively.
 */
export const enum ClaudeSessionConfigKey {
	/** `'permissionMode'` — Claude SDK approval mode. */
	PermissionMode = 'permissionMode',
	/**
	 * `'zoral.claudeConfigDir'` — the user's own Claude folder, which the
	 * session's CLI runs with as `CLAUDE_CONFIG_DIR` (Zoral fork). The agent host
	 * is one process shared by every window, so it cannot tell users apart; the
	 * renderer supplies this from the workspace setting of the same name, which
	 * Zoral Management Studio writes into each user's workspace file along with
	 * a credential in that folder. Not advertised in the schema: nothing to pick.
	 */
	ConfigDir = 'zoral.claudeConfigDir',
}

/**
 * Narrows a session-config value to a usable {@link ClaudeSessionConfigKey.ConfigDir}:
 * an absolute POSIX path, or `undefined`.
 */
export function narrowClaudeConfigDir(raw: unknown): string | undefined {
	return typeof raw === 'string' && raw.startsWith('/') ? raw : undefined;
}

/**
 * Permission-mode values advertised in the Claude session-config schema.
 */
export type ClaudePermissionMode = 'default' | 'acceptEdits' | 'bypassPermissions' | 'plan' | 'auto';

/**
 * Single source of truth for narrowing an arbitrary runtime value to the
 * closed {@link ClaudePermissionMode} union. Returns `undefined` for
 * non-strings or unmatched strings; callers apply their own fallback.
 */
export function narrowClaudePermissionMode(raw: unknown): ClaudePermissionMode | undefined {
	switch (raw) {
		case 'default':
		case 'acceptEdits':
		case 'bypassPermissions':
		case 'plan':
		case 'auto':
			return raw;
		default:
			return undefined;
	}
}
