"use client";
import { createTableAction } from "@/actions/table";
import { FormFields } from "@/app/types";
import { EditableTableViewer } from "@/components/editable-table";
import { Stack, Flex, Input, HStack, Button } from "@chakra-ui/react";
import Link from "next/link";
import { useForm, FormProvider } from "react-hook-form";
import { Toaster, toaster } from "@/components/ui/toaster";
import { redirect } from "next/navigation";

type ContentProps = {
  workspaceID: string;
  namespaceName: string;
};

export const Content = (props: ContentProps) => {
  const form = useForm<FormFields>({
    defaultValues: {
      name: "",
      fields: [],
    },
  });
  const { register, handleSubmit } = form;
  const createTable = handleSubmit(async (data) => {
    const result = await createTableAction(
      props.workspaceID,
      props.namespaceName,
      data
    );

    if (!result.success) {
      toaster.create({
        description: result.result.message,
        type: "error",
      });
      return;
    }

    redirect(`/workspace/${props.workspaceID}`);
  });

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
          <Button size="xs" onClick={createTable}>
            Create table
          </Button>
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
      <Toaster />
    </Stack>
  );
};
