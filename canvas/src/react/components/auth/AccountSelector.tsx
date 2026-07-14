import React from "react";
import { AccountInfo } from "@azure/msal-browser";
import {
	Dialog,
	DialogSurface,
	DialogTitle,
	DialogContent,
	DialogActions,
	DialogBody,
} from "@fluentui/react-dialog";
import { Button } from "@fluentui/react-button";
import { Text } from "@fluentui/react-text";
import { Avatar } from "@fluentui/react-avatar";
import { PersonRegular, AddRegular } from "@fluentui/react-icons";

interface AccountSelectorProps {
	accounts: AccountInfo[];
	onAccountSelected: (account: AccountInfo) => void;
	onCancel: () => void;
	onAddAccount: () => void;
}

export const AccountSelector: React.FC<AccountSelectorProps> = ({
	accounts,
	onAccountSelected,
	onCancel,
	onAddAccount,
}) => {
	return (
		<Dialog open={true} modalType="modal">
			<DialogSurface>
				<DialogBody>
					<DialogTitle>Choose an Account</DialogTitle>
					<DialogContent>
						<Text>
							Multiple accounts are available. Please choose which account to use:
						</Text>
						<div className="mt-4 space-y-2">
							{accounts.map((account, index) => (
								<Button
									key={account.homeAccountId || index}
									appearance="outline"
									onClick={() => onAccountSelected(account)}
									className="w-full p-4 h-auto flex items-center justify-start gap-3"
									style={{
										width: "100%",
										padding: "12px",
										height: "auto",
										display: "flex",
										alignItems: "center",
										justifyContent: "flex-start",
										gap: "12px",
										textAlign: "left",
									}}
								>
									<Avatar
										name={account.name || account.username}
										icon={<PersonRegular />}
										size={32}
									/>
									<div
										style={{
											display: "flex",
											flexDirection: "column",
											alignItems: "flex-start",
										}}
									>
										<Text weight="semibold">
											{account.name || account.username}
										</Text>
										<Text size={200} style={{ color: "#666" }}>
											{account.username}
										</Text>
									</div>
								</Button>
							))}
							<Button
								appearance="outline"
								onClick={onAddAccount}
								className="w-full p-4 h-auto flex items-center justify-start gap-3"
								style={{
									width: "100%",
									padding: "12px",
									height: "auto",
									display: "flex",
									alignItems: "center",
									justifyContent: "flex-start",
									gap: "12px",
									textAlign: "left",
									borderStyle: "dashed",
								}}
							>
								<Avatar icon={<AddRegular />} size={32} />
								<div
									style={{
										display: "flex",
										flexDirection: "column",
										alignItems: "flex-start",
									}}
								>
									<Text weight="semibold">Use a different account</Text>
									<Text size={200} style={{ color: "#666" }}>
										Sign in with a new account
									</Text>
								</div>
							</Button>
						</div>
					</DialogContent>
					<DialogActions>
						<Button appearance="secondary" onClick={onCancel}>
							Cancel
						</Button>
					</DialogActions>
				</DialogBody>
			</DialogSurface>
		</Dialog>
	);
};
