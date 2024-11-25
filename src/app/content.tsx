"use client";
import { useState } from "react";
import { WorkspacesResult } from "./types";
import { useRouter } from "next/navigation";

const WorkspaceSelector = (props: {
  ws: WorkspacesResult;
  onChange: (workspaceId: string) => void;
}) => {
  const { ws } = props;

  return (
    <select onChange={(e) => props.onChange(e.target.value)}>
      {ws.workspaces.map((workspace) => (
        <option key={workspace.id} value={workspace.id}>
          {workspace.name}
        </option>
      ))}
    </select>
  );
};

type ContentProps = {
  ws: WorkspacesResult;
};

export const Content = (props: ContentProps) => {
  const { ws } = props;
  const [currentWorkspace, setCurrentWorkspace] = useState<string | null>(
    ws.workspaces.length > 0 ? ws.workspaces[0].id : null
  );
  const router = useRouter();

  return (
    <div className="flex flex-col">
      <WorkspaceSelector ws={ws} onChange={setCurrentWorkspace} />
      <button
        onClick={() => {
          console.log(currentWorkspace);
          if (currentWorkspace) {
            router.push(`/workspace/${currentWorkspace}`);
          }
        }}
      >
        Go to workspace
      </button>
    </div>
  );
};
