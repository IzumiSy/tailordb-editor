"use client";
import { deleteTableAction } from "@/actions/table";
import { fieldTypes, FormFields, TailorDBType } from "@/app/types";
import { Stack, Flex, HStack, Button, Input } from "@chakra-ui/react";
import {
  MenuRoot,
  MenuTrigger,
  MenuContent,
  MenuItem,
} from "@/components/ui/menu";
import Link from "next/link";
import { useTransition } from "react";
import { redirect } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { EditableTableViewer } from "@/components/editable-table";

type ContentProps = {
  workspaceID: string;
  namespaceName: string;
  currentType: TailorDBType;
};

export const Content = (props: ContentProps) => {
  const form = useForm<FormFields>({
    defaultValues: {
      name: props.currentType.name,
      fields: Object.keys(props.currentType.schema.fields).flatMap((name) => {
        const field = props.currentType.schema.fields[name];
        return [
          {
            name,
            type: field.type as keyof typeof fieldTypes,
            description: field.description,
            foreignKey: field.foreignKey ? "on" : false,
            foreignKeyType: field.foreignKeyType,
            required: field.required ? "on" : false,
            index: field.index ? "on" : false,
            unique: false,
            nested: false,
            array: false,
          } as const,
        ];
      }),
    },
  });
  const { register } = form;
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
      <Flex p={2} justifyContent={"space-between"} width={"100%"} gap={2}>
        <Input
          placeholder="Table name"
          size="xs"
          {...register("name", {
            required: true,
          })}
        />
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
      <FormProvider {...form}>
        <EditableTableViewer />
      </FormProvider>
    </Stack>
  );
};
