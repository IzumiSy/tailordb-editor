"use client";
import { useState } from "react";
import { WorkspacesResult } from "../types";
import { useRouter } from "next/navigation";
import { Text, Box, Button, Center, Stack } from "@chakra-ui/react";
import {
  NativeSelectField,
  NativeSelectRoot,
} from "@/components/ui/native-select";
import { revokeTokenAction } from "@/actions/token";

const WorkspaceSelector = (props: {
  ws: WorkspacesResult;
  onChange: (workspaceId: string) => void;
}) => {
  const { ws } = props;

  return (
    <NativeSelectRoot>
      <NativeSelectField onChange={(e) => props.onChange(e.target.value)}>
        {ws.workspaces.map((workspace) => (
          <option key={workspace.id} value={workspace.id}>
            {workspace.name}
          </option>
        ))}
      </NativeSelectField>
    </NativeSelectRoot>
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
    <Center backgroundColor="gray.100" height="100vh">
      <Box
        width="550px"
        p={5}
        backgroundColor="white"
        borderRadius="sm"
        boxShadow="xs"
      >
        <Stack>
          <Text>Select a workspace to see with editor</Text>
          <WorkspaceSelector ws={ws} onChange={setCurrentWorkspace} />
          <Button
            onClick={() => {
              if (currentWorkspace) {
                router.push(`/workspace/${currentWorkspace}`);
              }
            }}
          >
            Go to workspace
          </Button>
          <Button
            colorPalette="red"
            variant="ghost"
            onClick={() => {
              revokeTokenAction();
            }}
          >
            Revoke authentication
          </Button>
        </Stack>
      </Box>
    </Center>
  );
};
