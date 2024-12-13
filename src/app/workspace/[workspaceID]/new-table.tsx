"use client";
import {
  fieldTypes,
  FormFields,
  TailorDBTypesResult,
  WorkspaceResult,
} from "@/app/types";
import {
  Text,
  Stack,
  Heading,
  HStack,
  IconButton,
  Input,
  Flex,
  Button,
  NativeSelectRoot,
  NativeSelectField,
  DrawerBackdrop,
  DrawerBody,
  DrawerCloseTrigger,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerRoot,
  DrawerTitle,
  DrawerTrigger,
} from "@chakra-ui/react";
import { Checkbox } from "@/components/ui/checkbox";
import { useEffect, useState, useTransition } from "react";
import { useFieldArray, useForm, UseFormReturn } from "react-hook-form";
import { RxCross1 } from "react-icons/rx";
import { createTableAction } from "@/actions/table";

export const emptyField = {
  name: "",
  description: "",
  type: "string",
  required: false,
  index: false,
  unique: false,
  nested: false,
  array: false,
} as const;

export const NewTableDrawer = (props: {
  drawerOpened: boolean;
  setDrawerOpened: (opened: boolean) => void;
  namespaceName: string;
  workspace: WorkspaceResult["workspace"];
  tailorDBTypes: TailorDBTypesResult["tailordbTypes"];
}) => {
  const { fields, register, handleSubmit, renderComponents } =
    useNewTableForm();
  const [isCreatingTable, startCreatingTable] = useTransition();
  const [error, setError] = useState<Error | null>(null);
  const createTable = handleSubmit((data) => {
    startCreatingTable(async () => {
      const result = await createTableAction(
        props.workspace.id,
        props.namespaceName,
        data
      );
      if (!result.success) {
        setError(result.result);
        return;
      }
      props.setDrawerOpened(false);
    });
  });

  return (
    <DrawerRoot
      size="xl"
      open={props.drawerOpened}
      onOpenChange={(e) => props.setDrawerOpened(e.open)}
      placement="start"
    >
      <DrawerBackdrop />
      <DrawerTrigger />
      <DrawerContent>
        <DrawerCloseTrigger />
        <DrawerHeader borderColor={"gray.200"} borderBottomWidth={"1px"}>
          <Stack>
            <DrawerTitle>New Table</DrawerTitle>
            <Input
              placeholder="Table Name"
              {...register("name", { required: true })}
            />
          </Stack>
        </DrawerHeader>
        <DrawerBody px={0}>
          <Stack py={2} px={4}>
            {renderComponents({
              tailorDBTypes: props.tailorDBTypes,
            })}
          </Stack>
        </DrawerBody>
        <DrawerFooter borderColor={"gray.200"} borderTopWidth={"1px"}>
          <Stack flexGrow={1}>
            {error && (
              <Flex>
                <Text color="red.500">{error.message}</Text>
              </Flex>
            )}
            <Flex flexGrow={1}>
              <Button
                width="100%"
                disabled={fields.length === 0 || isCreatingTable}
                onClick={createTable}
              >
                Create
              </Button>
            </Flex>
          </Stack>
        </DrawerFooter>
      </DrawerContent>
    </DrawerRoot>
  );
};

export const useNewTableForm = () => {
  const form = useForm<FormFields>();
  const { control, register, watch, handleSubmit } = form;
  const fieldsOp = useFieldArray({
    control: control,
    name: "fields",
  });

  const renderComponents = (props: {
    tailorDBTypes: TailorDBTypesResult["tailordbTypes"];
  }) => (
    <>
      {fieldsOp.fields.map((_, index) => {
        const fieldTypeName = watch(`fields.${index}.type`);
        const hasSource = watch(`fields.${index}.hasSource`);

        return (
          <Stack
            key={index}
            p={2}
            borderColor={"gray.200"}
            borderWidth={"1px"}
            boxShadow={"xs"}
          >
            <HStack alignItems={"self-start"}>
              <IconButton
                variant={"ghost"}
                size="xs"
                onClick={() => fieldsOp.remove(index)}
              >
                <RxCross1 />
              </IconButton>
              <Stack flexGrow={1}>
                <HStack>
                  <Input
                    placeholder="Field Name"
                    {...register(`fields.${index}.name`, {
                      required: true,
                    })}
                  />
                  {!hasSource && (
                    <NativeSelectRoot width={"200px"}>
                      <NativeSelectField
                        {...register(`fields.${index}.type`, {
                          required: true,
                        })}
                        placeholder="Field type"
                      >
                        {Object.keys(fieldTypes).map((key) => {
                          const typeKey = key as keyof typeof fieldTypes;
                          const type = fieldTypes[typeKey];

                          return (
                            <option key={typeKey} value={typeKey}>
                              {type.label}
                            </option>
                          );
                        })}
                      </NativeSelectField>
                    </NativeSelectRoot>
                  )}
                </HStack>
                <Input
                  placeholder="Description"
                  {...register(`fields.${index}.description`, {
                    required: true,
                  })}
                />
                <FieldSpecificForm
                  index={index}
                  form={form}
                  fieldTypeName={fieldTypeName}
                  tailorDBTypes={props.tailorDBTypes}
                />
              </Stack>
            </HStack>
          </Stack>
        );
      })}
      <Button
        size="sm"
        variant="outline"
        onClick={() => fieldsOp.append(emptyField)}
      >
        Add Field
      </Button>
    </>
  );

  return {
    fields: fieldsOp.fields,
    register,
    handleSubmit,
    renderComponents,
  };
};

export const FieldSpecificForm = (props: {
  index: number;
  form: UseFormReturn<FormFields>;
  fieldTypeName: keyof typeof fieldTypes;
  tailorDBTypes: TailorDBTypesResult["tailordbTypes"];
}) => {
  const { fieldTypeName, index } = props;
  const { register, watch, setValue } = props.form;
  const fields = watch("fields");
  const hasSource = watch(`fields.${index}.hasSource`);
  const sourceID = watch(`fields.${index}.sourceID`);
  const name = watch(`fields.${index}.name`);
  const uuidFields = (fields ?? []).filter(
    (field) => field.type === "uuid" && field.name && field.name !== name
  );

  useEffect(() => {
    if (!sourceID) {
      return;
    }

    const sourceField = fields.find((field) => field.name === sourceID);
    const foreignKeyType = sourceField?.foreignKeyType;
    if (!foreignKeyType) {
      setValue(`fields.${index}.sourceID`, undefined);
      return;
    }

    setValue(`fields.${index}.type`, foreignKeyType as keyof typeof fieldTypes);
  }, [sourceID]);

  return (
    <>
      {fieldTypeName === "enum" && (
        <Stack p={2} borderColor={"gray.200"} borderWidth={"1px"}>
          <Heading size="xs">Enum entries</Heading>
          <HStack>
            <IconButton variant={"ghost"} size="xs">
              <RxCross1 />
            </IconButton>
            <Input placeholder="Enum name" width="300px" />
            <Input placeholder="Enum description" />
          </HStack>
          <Flex flexGrow={1}>
            <Button size="xs" variant="outline" width="100%">
              Add Enum
            </Button>
          </Flex>
        </Stack>
      )}
      <HStack>
        <Checkbox {...register(`fields.${index}.hasSource`)}>Source</Checkbox>
        {hasSource ? (
          <>
            <NativeSelectRoot width={"200px"}>
              <NativeSelectField
                {...register(`fields.${index}.sourceID`, {
                  required: hasSource,
                })}
                placeholder="Source ID field"
              >
                {uuidFields.map((field) => (
                  <option key={field.name} value={field.name}>
                    {field.name}
                  </option>
                ))}
              </NativeSelectField>
            </NativeSelectRoot>
            <NativeSelectRoot width={"300px"}>
              <NativeSelectField
                {...register(`fields.${index}.type`, {
                  required: hasSource,
                })}
                placeholder="Source table"
              >
                {props.tailorDBTypes.map((type) => (
                  <option key={type.name} value={type.name}>
                    {type.name}
                  </option>
                ))}
              </NativeSelectField>
            </NativeSelectRoot>
          </>
        ) : (
          <>
            <Checkbox {...register(`fields.${index}.nested`)}>Nested</Checkbox>
            <Checkbox {...register(`fields.${index}.array`)}>Array</Checkbox>
            <Checkbox {...register(`fields.${index}.required`)}>
              Required
            </Checkbox>
            <Checkbox {...register(`fields.${index}.index`)}>Index</Checkbox>
            <Checkbox {...register(`fields.${index}.unique`)}>Unique</Checkbox>
            {fieldTypeName === "uuid" && (
              <>
                <Checkbox {...register(`fields.${index}.foreignKey`)}>
                  Foreign key
                </Checkbox>
                <NativeSelectRoot width={"200px"}>
                  <NativeSelectField
                    {...register(`fields.${index}.foreignKeyType`)}
                    placeholder="Foreign key table"
                  >
                    {props.tailorDBTypes.map((type) => (
                      <option key={type.name} value={type.name}>
                        {type.name}
                      </option>
                    ))}
                  </NativeSelectField>
                </NativeSelectRoot>
              </>
            )}
          </>
        )}
      </HStack>
    </>
  );
};
