/**
 * Account Selector Hook
 *
 * Custom React hook for managing Microsoft account selection when multiple
 * MSAL accounts are available. This hook provides a complete account selection
 * workflow with promise-based resolution for integration with authentication flows.
 *
 * Key Features:
 * - Promise-based account selection for async/await usage
 * - State management for account selector dialog visibility
 * - Account list management and display
 * - Selected account tracking
 * - Cancellation support (returns null when cancelled)
 * - Integration with MSAL authentication workflows
 *
 * This hook is typically used during sign-in when multiple accounts are cached
 * in MSAL and the user needs to choose which account to use for the session.
 */

import { useState, useCallback } from "react";
import { AccountInfo } from "@azure/msal-browser";

/**
 * Return type for the useAccountSelector hook.
 * Provides all necessary state and functions for account selection.
 */
interface UseAccountSelectorReturn {
	/** Whether the account selector dialog is currently open */
	isOpen: boolean;

	/** Array of available accounts to choose from */
	accounts: AccountInfo[];

	/** Function to show the account selector with a list of accounts */
	showAccountSelector: (accounts: AccountInfo[]) => Promise<AccountInfo | null>;

	/** Function to hide the account selector and cancel selection */
	hideAccountSelector: () => void;

	/** Function to select a specific account */
	selectAccount: (account: AccountInfo) => void;

	/** The currently selected account (null if none selected) */
	selectedAccount: AccountInfo | null;
}

/**
 * Custom hook for managing account selection when multiple MSAL accounts are available.
 * Provides a promise-based interface for showing an account selector and getting the user's choice.
 *
 * @returns Object containing state and functions for account selection
 *
 * Usage example:
 * ```tsx
 * const { showAccountSelector, isOpen, accounts, selectAccount } = useAccountSelector();
 *
 * // Show account selector and wait for user choice
 * const selectedAccount = await showAccountSelector(availableAccounts);
 * if (selectedAccount) {
 *   // User selected an account
 *   console.log('Selected:', selectedAccount.username);
 * } else {
 *   // User cancelled selection
 *   console.log('Selection cancelled');
 * }
 * ```
 */
export function useAccountSelector(): UseAccountSelectorReturn {
	/** Controls whether the account selector dialog is visible */
	const [isOpen, setIsOpen] = useState(false);

	/** Array of accounts available for selection */
	const [accounts, setAccounts] = useState<AccountInfo[]>([]);

	/** The account selected by the user */
	const [selectedAccount, setSelectedAccount] = useState<AccountInfo | null>(null);

	/** Promise resolve function for async account selection */
	const [resolvePromise, setResolvePromise] = useState<
		((account: AccountInfo | null) => void) | null
	>(null);

	/**
	 * Shows the account selector with the provided list of accounts.
	 * Returns a promise that resolves when the user selects an account or cancels.
	 *
	 * @param accountList - Array of MSAL AccountInfo objects to display
	 * @returns Promise that resolves to the selected account or null if cancelled
	 */
	const showAccountSelector = useCallback(
		(accountList: AccountInfo[]): Promise<AccountInfo | null> => {
			return new Promise((resolve) => {
				setAccounts(accountList);
				setIsOpen(true);
				setResolvePromise(() => resolve);
			});
		},
		[]
	);

	/**
	 * Hides the account selector and cancels the selection process.
	 * Resolves the pending promise with null to indicate cancellation.
	 */
	const hideAccountSelector = useCallback(() => {
		setIsOpen(false);
		setAccounts([]);
		if (resolvePromise) {
			resolvePromise(null); // Resolve with null to indicate cancellation
			setResolvePromise(null);
		}
	}, [resolvePromise]);

	/**
	 * Selects the specified account and completes the selection process.
	 * Hides the selector and resolves the pending promise with the selected account.
	 *
	 * @param account - The MSAL AccountInfo object selected by the user
	 */
	const selectAccount = useCallback(
		(account: AccountInfo) => {
			setSelectedAccount(account);
			setIsOpen(false);
			setAccounts([]);
			if (resolvePromise) {
				resolvePromise(account); // Resolve with the selected account
				setResolvePromise(null);
			}
		},
		[resolvePromise]
	);

	return {
		isOpen,
		accounts,
		showAccountSelector,
		hideAccountSelector,
		selectAccount,
		selectedAccount,
	};
}
