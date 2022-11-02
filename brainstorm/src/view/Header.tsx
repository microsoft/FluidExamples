import { Text, CommandBar, ICommandBarItemProps, Facepile } from "@fluentui/react";
import { AzureMember } from "@fluidframework/azure-client";
import React from "react";
import { BrainstormModel } from "../BrainstormModel";
import { DefaultColor } from "./Color";
import { ColorPicker } from "./ColorPicker";
import { NoteData } from "../Types";
import { NOTE_SIZE } from "./Note.style";

function uuidv4() {
	return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
		var r = (Math.random() * 16) | 0,
			v = c === "x" ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
}
export interface HeaderProps {
	model: BrainstormModel;
	author: AzureMember;
	members: AzureMember[];
}

export function Header(props: HeaderProps) {
	const colorButtonRef = React.useRef<any>();
	const [color, setColor] = React.useState(DefaultColor);
	const personas = React.useMemo(
		() =>
			props.members.map((member) => {
				return { personaName: member.userName };
			}),
		[props.members],
	);

	// add in all the default attributes needed for a new note, including setting the last edited author as the
	// user (since user created the note).
	const onAddNote = () => {
		const { scrollHeight, scrollWidth } = document.getElementById("NoteSpace")!;
		const id = uuidv4();
		const newCardData: NoteData = {
			id,
			position: {
				x: Math.floor(Math.random() * (scrollWidth - NOTE_SIZE.width)),
				y: Math.floor(Math.random() * (scrollHeight - NOTE_SIZE.height)),
			},
			lastEdited: {
				userId: props.author.userId,
				userName: props.author.userName,
				time: Date.now(),
			},
			author: props.author,
			numLikesCalculated: 0,
			didILikeThisCalculated: false,
			color,
		};
		props.model.SetNote(id, newCardData);
	};

	const items: ICommandBarItemProps[] = [
		{
			key: "title",
			onRender: () => (
				<Text
					variant="xLarge"
					styles={{
						root: { alignSelf: "center", marginBottom: 6, marginRight: 16 },
					}}
				>
					Let's Brainstorm
				</Text>
			),
		},
		{
			key: "add",
			text: "Add note",
			onClick: onAddNote,
			iconProps: {
				iconName: "QuickNote",
			},
		},
		{
			componentRef: colorButtonRef,
			key: "color",
			text: "Default Color",
			iconProps: {
				iconName: "Color",
			},
			subMenuProps: {
				key: "color-picker",
				items: [{ key: "foo" }],
				onRenderMenuList: () => (
					<ColorPicker
						parent={colorButtonRef}
						selectedColor={color}
						setColor={setColor}
					/>
				),
			},
		},
	];

	const farItems: ICommandBarItemProps[] = [
		{
			key: "presence",
			onRender: () => (
				<Facepile styles={{ root: { alignSelf: "center" } }} personas={personas} />
			),
		},
	];
	return <CommandBar styles={{ root: { paddingLeft: 0 } }} items={items} farItems={farItems} />;
}
