import {
  CommandBar,
  CommandBarButton,
  DirectionalHint,
  ICommandBarItemProps,
  IResizeGroupProps,
  ITooltipProps,
  mergeStyles,
  PersonaCoin,
  TooltipHost,
} from "@fluentui/react";
import React from "react";
import { ColorPicker } from "./ColorPicker";
import {
  getHeaderStyleForColor,
  deleteButtonStyle,
  colorButtonStyle,
  likesButtonStyle,
  tooltipHostStyle,
} from "./Note.style";
import { ReactionListCallout } from "./ReactionListCallout";
import { NoteProps } from "./Note"

const HeaderComponent = (props: NoteProps) => {
  const colorButtonRef = React.useRef();

  const headerProps = {
    className: mergeStyles(getHeaderStyleForColor(props.color)),
  };

  const likeBtnTooltipProps: ITooltipProps = {

    onRenderContent: () => {
      const likedUserList = props.getLikedUsers();

      if (likedUserList.length === 0) {
        // Don't render a tooltip if no users reacted.
        return null;
      }
      return (
        <ReactionListCallout
          label={"Like Reactions"}
          reactionIconName={"Like"}
          usersToDisplay={likedUserList}
        />
      );
    },
    calloutProps: {
      beakWidth: 10,
    },
  };

  const items: ICommandBarItemProps[] = [
    {
      key: "persona",
      onRender: () => {
        return (
          <TooltipHost
            styles={{ root: { alignSelf: "center", display: "block" } }}
            content={props.author.userName}
          >
            <PersonaCoin
              styles={{
                coin: {
                  alignSelf: "center",
                  margin: "0px 8px",
                  userSelect: "none",
                },
              }}
              text={props.author.userName}
              coinSize={24}
            />
          </TooltipHost>
        );
      },
    },
  ];

  const farItems: ICommandBarItemProps[] = [
    {
      key: "likes",
      onClick: props.onLike,
      text: props.numLikesCalculated.toString(),
      iconProps: {
        iconName: props.didILikeThisCalculated ? "LikeSolid" : "Like",
      },
      buttonStyles: likesButtonStyle,
      commandBarButtonAs: (props) => {
        return (
          <TooltipHost
            tooltipProps={likeBtnTooltipProps}
            directionalHint={DirectionalHint.topAutoEdge}
            styles={tooltipHostStyle}
          >
            <CommandBarButton {...(props as any)} />
          </TooltipHost>
        );
      },
    },
    {
      // @ts-ignore
      componentRef: colorButtonRef,
      key: "color",
      iconProps: {
        iconName: "Color",
      },
      subMenuProps: {
        key: "color-picker",
        items: [{ key: "foo" }],
        onRenderMenuList: () => (
          <ColorPicker
            parent={colorButtonRef}
            selectedColor={props.color!}
            setColor={(color) => props.onColorChange(color)}
          />
        ),
      },
      buttonStyles: colorButtonStyle,
    },
    {
      key: "delete",
      iconProps: { iconName: "Clear" },
      title: "Delete Note",
      onClick: props.onDelete,
      buttonStyles: deleteButtonStyle,
    },
  ];

  const nonResizingGroup = (props: IResizeGroupProps) => (
    <div>
      <div style={{ position: "relative" }}>
        {props.onRenderData(props.data)}
      </div>
    </div>
  );

  return (
    <div {...headerProps}>
      <CommandBar
        resizeGroupAs={nonResizingGroup}
        styles={{
          root: { padding: 0, height: 36, backgroundColor: "transparent" },
        }}
        items={items}
        farItems={farItems}
      />
    </div>
  )
}

export const NoteHeader = React.memo(HeaderComponent, (prevProps, nextProps) => {
  return prevProps.color === nextProps.color
    && prevProps.numLikesCalculated === nextProps.numLikesCalculated
    && prevProps.didILikeThisCalculated === nextProps.didILikeThisCalculated
})
