import {
  CommandBar,
  CommandBarButton,
  DirectionalHint,
  ICommandBarItemProps,
  IContextualMenuRenderItem,
  IRefObject,
  IResizeGroupProps,
  mergeStyles,
  PersonaCoin,
  TooltipHost,
} from '@fluentui/react';
import { AzureMember } from '@fluidframework/azure-client';
import React from 'react';
import {
  useDidILike,
  useLikeStats,
  useNoteAuthor,
  useNoteColor,
  useNoteStatus,
} from '../brainstorm-hooks';
import { ColorPicker } from '../components/ColorPicker';
import { useMyself } from '../core/use-myself';
import { ColorId, DefaultColor, NoteStatus } from '../Types';
import {
  colorButtonStyle,
  deleteButtonStyle,
  getHeaderStyleForColor,
  likesButtonStyle,
  tooltipHostStyle,
} from './Note.style';
import { ReactionListCallout } from './ReactionListCallout';

interface NoteHeaderProps {
  noteId: string;
}
export function NoteHeader(props: NoteHeaderProps) {
  const noteId = props.noteId;

  const colorButtonRef = React.useRef<any>();
  const myself = useMyself();

  const [author] = useNoteAuthor(noteId);
  const [, setNoteStatus] = useNoteStatus(noteId);
  let [color, setColor] = useNoteColor(noteId);
  color = color || DefaultColor;

  const { numLikes } = useLikeStats(noteId);
  const { didILike, toggleLike } = useDidILike(noteId);

  const headerProps = {
    className: mergeStyles(getHeaderStyleForColor(color!)),
  };

  const items = [createPersonaAvatar(myself, author)];

  const farItems = [
    createLikeButton(noteId, toggleLike, numLikes, didILike),
    createColorPicker(color, setColor, colorButtonRef),
    createDeleteNoteButton(setNoteStatus),
  ];

  const nonResizingGroup = (props: IResizeGroupProps) => (
    <div>
      <div style={{ position: 'relative' }}>
        {props.onRenderData(props.data)}
      </div>
    </div>
  );

  return (
    <div {...headerProps}>
      <CommandBar
        resizeGroupAs={nonResizingGroup}
        styles={{
          root: { padding: 0, height: 36, backgroundColor: 'transparent' },
        }}
        items={items}
        farItems={farItems}
      />
    </div>
  );
}

function createPersonaAvatar(myself: AzureMember, author?: AzureMember) {
  const tooltipAuthorName =
    myself.userId === author?.userId ? 'you' : author?.userName;

  return {
    key: 'persona',
    onRender: () => {
      return (
        <TooltipHost
          styles={{ root: { alignSelf: 'center', display: 'block' } }}
          content={`Created by ${tooltipAuthorName}`}
        >
          <PersonaCoin
            styles={{
              coin: {
                alignSelf: 'center',
                margin: '0px 8px',
                userSelect: 'none',
              },
            }}
            text={author?.userName}
            coinSize={24}
          />
        </TooltipHost>
      );
    },
  };
}

function createLikeButton(
  noteId: string,
  onLike: () => void,
  numLikes: number,
  didILike: boolean,
): ICommandBarItemProps {
  const tooltipProps = {
    onRenderContent: () => {
      return <ReactionListCallout noteId={noteId} />;
    },
    calloutProps: {
      beakWidth: 10,
    },
  };

  return {
    key: 'likes',
    onClick: onLike,
    text: numLikes.toString(),
    iconProps: {
      iconName: didILike ? 'LikeSolid' : 'Like',
    },
    buttonStyles: likesButtonStyle,
    commandBarButtonAs: (props) => {
      return (
        <TooltipHost
          tooltipProps={tooltipProps}
          directionalHint={DirectionalHint.topAutoEdge}
          styles={tooltipHostStyle}
        >
          <CommandBarButton {...(props as any)} />
        </TooltipHost>
      );
    },
  };
}

function createColorPicker(
  color: ColorId,
  onSetColor: (v: ColorId) => void,
  componentRef: IRefObject<IContextualMenuRenderItem>,
): ICommandBarItemProps {
  return {
    // @ts-ignore
    componentRef: componentRef,
    key: 'color',
    iconProps: {
      iconName: 'Color',
    },
    subMenuProps: {
      key: 'color-picker',
      items: [{ key: 'foo' }],
      onRenderMenuList: () => (
        <ColorPicker
          parent={componentRef}
          selectedColor={color!}
          setColor={onSetColor}
        />
      ),
    },
    buttonStyles: colorButtonStyle,
  };
}

function createDeleteNoteButton(setNoteStatus: (status: NoteStatus) => void) {
  return {
    key: 'delete',
    iconProps: { iconName: 'Clear' },
    title: 'Delete Note',
    onClick: () => setNoteStatus(NoteStatus.Deleted),
    buttonStyles: deleteButtonStyle,
  };
}
