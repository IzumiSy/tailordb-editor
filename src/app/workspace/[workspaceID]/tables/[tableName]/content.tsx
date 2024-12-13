"use client";
import { deleteTableAction } from "@/actions/table";
import { TailorDBType } from "@/app/types";
import { TailorDBTable } from "@/components/table";
import { Stack, Flex, Heading, HStack, Button } from "@chakra-ui/react";
import {
  MenuRoot,
  MenuTrigger,
  MenuContent,
  MenuItem,
} from "@/components/ui/menu";
import Link from "next/link";
import { useTransition } from "react";
import { redirect } from "next/navigation";

type ContentProps = {
  workspaceID: string;
  namespaceName: string;
  currentType: TailorDBType;
};

export const Content = (props: ContentProps) => {
  const [isDeletingTable, startDeletingTable] = useTransition();
  const deleteTable = () => {
    startDeletingTable(async () => {
      await deleteTableAction(
        props.workspaceID,
        props.namespaceName,
        props.currentType.name
      );
      redirect(`/workspace/${props.workspaceID}`);
    });
  };

  return (
    <Stack width={"100%"} gap={0}>
      <Flex p={2} justifyContent={"space-between"} width={"100%"}>
        <Heading>{props.currentType.name}</Heading>
        <HStack>
          <Button size="xs">Save changes</Button>
          <MenuRoot>
            <MenuTrigger asChild>
              <Button variant="outline" size="xs">
                Actions
              </Button>
            </MenuTrigger>
            <MenuContent>
              <MenuItem
                color="red"
                value="delete"
                disabled={isDeletingTable}
                onClick={deleteTable}
              >
                Delete
              </MenuItem>
            </MenuContent>
          </MenuRoot>
          <Button
            as={Link}
            // @ts-ignore
            href={`/workspace/${props.workspaceID}`}
            size="xs"
            variant="ghost"
          >
            Close
          </Button>
        </HStack>
      </Flex>
      <TailorDBTable
        data={props.currentType.schema.fields || {}}
        handlers={{
          onClickSourceType: (typeName) => void 0,
        }}
      />
    </Stack>
  );
};
