// A pane that shows comments and allows users to interact with them
import { Button, Textarea } from "@fluentui/react-components";
import { CommentRegular } from "@fluentui/react-icons";
import React, {
	forwardRef,
	ReactNode,
	useContext,
	useEffect,
	useImperativeHandle,
	useRef,
	useState,
} from "react";
import { App, Comment, Comments, Item } from "../../../schema/appSchema.js";
import { findItemById } from "../../../utils/itemsHelpers.js";
import { Pane } from "./Pane.js";
import { useTree } from "../../hooks/useTree.js";
import { getContentHandler } from "../../../utils/contentHandlers.js";
import { PresenceContext } from "../../contexts/PresenceContext.js";
import { VoteButton } from "../toolbar/buttons/EditButtons.js";

export interface CommentPaneRef {
	focusInput: () => void;
}

export const CommentPane = forwardRef<
	CommentPaneRef,
	{
		hidden: boolean;
		setHidden: (hidden: boolean) => void;
		itemId: string;
		app: App;
	}
>((props, ref) => {
	const { hidden, setHidden, app } = props;
	const presence = useContext(PresenceContext);
	const [title, setTitle] = useState("Comments");
	const commentInputRef = useRef<CommentInputRef>(null);

	useImperativeHandle(ref, () => ({
		focusInput: () => {
			commentInputRef.current?.focus();
		},
	}));

	useTree(app);
	const item = findItemById(app.items, props.itemId) ?? app;
	useEffect(() => {
		if (item instanceof Item) {
			const handler = getContentHandler(item);
			setTitle(`Comments on ${handler.getName()}`);
		} else {
			setTitle("General Comments");
		}
	}, [item]);

	const handleAddComment = (comment: string) => {
		if (comment.trim() === "") return;
		item.comments.addComment(
			comment,
			presence.users.getMyself().value.id,
			presence.users.getMyself().value.name
		);
	};

	return (
		<Pane hidden={hidden} setHidden={setHidden} title={title}>
			<CommentList comments={item.comments} />
			<CommentInput ref={commentInputRef} callback={(comment) => handleAddComment(comment)} />
		</Pane>
	);
});

CommentPane.displayName = "CommentPane";

export function CommentList(props: { comments: Comments }): JSX.Element {
	const { comments } = props;
	useTree(comments);
	return (
		<div className="relative flex flex-col grow space-y-2 overflow-y-auto">
			<div
				className={`absolute top-0 left-0 h-full w-full ${comments.length > 0 ? "hidden" : ""}`}
			>
				<CommentRegular className="h-full w-full opacity-10" />
			</div>
			{comments.map((comment) => (
				<CommentView key={comment.id} comment={comment} />
			))}
		</div>
	);
}

export function CommentView(props: { comment: Comment }): JSX.Element {
	const { comment } = props;
	useTree(comment, true);
	const presence = useContext(PresenceContext);
	const isMyComment = comment.userId === presence.users.getMyself().value.id;
	return (
		<div className={`z-100 ${isMyComment ? "ml-6" : "mr-6"} `}>
			<div className={`flex items-center justify-between mb-2`}>
				<div className="text-xs">{comment.username}</div>
				<div className="text-xs text-gray-500">
					{comment.createdAt.value.toLocaleString("en-US", {
						month: "short",
						day: "numeric",
						hour: "2-digit",
						minute: "2-digit",
					})}
				</div>
			</div>
			<SpeechBubble isUser={isMyComment}>
				<div className="">{comment.text}</div>
				<div className="flex items-center justify-between">
					<div className="text-xs text-gray-500">{comment.votes.votes.length} votes</div>
					<div className="flex items-center">
						<VoteButton vote={comment.votes} />
					</div>
				</div>
			</SpeechBubble>
		</div>
	);
}

export interface CommentInputRef {
	focus: () => void;
}

export const CommentInput = forwardRef<CommentInputRef, { callback: (comment: string) => void }>(
	(props, ref) => {
		const { callback } = props;
		const [comment, setComment] = useState("");
		const textareaRef = useRef<HTMLTextAreaElement>(null);

		useImperativeHandle(ref, () => ({
			focus: () => {
				textareaRef.current?.focus();
			},
		}));

		return (
			<div className="flex flex-col justify-self-end gap-y-2 ">
				<Textarea
					ref={textareaRef}
					className="flex"
					rows={4}
					value={comment}
					onChange={(e) => setComment(e.target.value)}
					placeholder="Type your comment here..."
				/>
				<Button
					className="flex "
					appearance="primary"
					onClick={() => {
						callback(comment);
						setComment("");
					}}
				>
					Comment
				</Button>
			</div>
		);
	}
);

CommentInput.displayName = "CommentInput";

export function SpeechBubble(props: { children: ReactNode; isUser: boolean }): JSX.Element {
	const { children, isUser } = props;
	return (
		<div
			className={`w-full px-4 py-2 rounded-xl ${
				isUser
					? "bg-indigo-100 text-black rounded-br-none"
					: "bg-white text-black rounded-bl-none"
			}`}
		>
			{children}
		</div>
	);
}
