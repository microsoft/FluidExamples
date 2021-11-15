import { AzureMember } from '@fluidframework/azure-client';
import { throttle } from 'lodash';
import React, { memo, useLayoutEffect } from 'react';
import { useMemberCursorPosition } from '../brainstorm-hooks';
import { MemberMouseCursor } from '../components/MemberMouseCursor';
import { useMyself } from '../core/use-myself';
import { useOtherMembers } from '../core/use-other-members';

export function MouseCursors() {
  const myself = useMyself();
  const otherMembers = useOtherMembers();

  const [, setMyPosition] = useMemberCursorPosition(myself.userId);

  useLayoutEffect(() => {
    function onMouseMove(e: MouseEvent) {
      const x = e.clientX;
      const y = e.clientY;
      setMyPosition({ x, y, lastModified: new Date().getTime() });
    }

    const throttledMouseMove = throttle(onMouseMove, 50);

    document.addEventListener('mousemove', throttledMouseMove);

    return () => {
      document.removeEventListener('mousemove', throttledMouseMove);
    };
  }, []);

  return (
    <>
      {Array.from(otherMembers.values()).map((m) => (
        <CursorMemo member={m} key={m.userId}></CursorMemo>
      ))}
    </>
  );
}

interface CursorProps {
  member: AzureMember<any>;
}
function Cursor(props: CursorProps) {
  const { member } = props;
  const [cursor] = useMemberCursorPosition(member.userId);

  if (!cursor) {
    return null;
  }

  if (new Date().getTime() - cursor.lastModified > 10 * 1000) {
    // if 10 seconds ellapsed with no movement, don't display the cursor
    return null;
  }

  return (
    <MemberMouseCursor
      x={cursor.x}
      y={cursor.y}
      userName={member.userName}
    ></MemberMouseCursor>
  );
}

const CursorMemo = memo(Cursor, (prev, next) => {
  return prev.member === next.member;
});
