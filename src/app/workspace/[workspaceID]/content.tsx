"use client";
import { TailorDBTypesResult, WorkspaceResult } from "@/app/types";
import { TailorDBTable } from "@/components/table";
import {
  Badge,
  Box,
  Button,
  DrawerFooter,
  Flex,
  Heading,
  HStack,
  IconButton,
  Input,
  Stack,
  Text,
} from "@chakra-ui/react";
import {
  DrawerBackdrop,
  DrawerBody,
  DrawerCloseTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerRoot,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Checkbox } from "@/components/ui/checkbox";
import { useEffect, useState } from "react";
import {
  NativeSelectField,
  NativeSelectRoot,
} from "@/components/ui/native-select";
import { SchemaViewer } from "./schema-viewer";
import { Allotment } from "allotment";
import "allotment/dist/style.css";
import { ReactFlowProvider, useReactFlow } from "@xyflow/react";
import { debounce } from "es-toolkit";
import Link from "next/link";
import { RxCross1 } from "react-icons/rx";
import {
  useFieldArray,
  useForm,
  UseFormReturn,
  useWatch,
} from "react-hook-form";
import { has } from "es-toolkit/compat";

type TailorDBTypes = TailorDBTypesResult["tailordbTypes"];
type TailorDBType = TailorDBTypes[number];

const getTailorDBTypeByName = (
  types: TailorDBTypes,
  name: string | undefined
) => types.find((type) => type.name === name) ?? null;

const TypeSelector = (props: {
  currentType: TailorDBType | null;
  types: TailorDBTypesResult["tailordbTypes"];
  onChange: (type: TailorDBType) => void;
}) => {
  const { types } = props;

  return (
    <NativeSelectRoot size="sm" variant="subtle">
      <NativeSelectField
        paddingX={2}
        value={props.currentType?.name}
        onChange={(e) => {
          const selectedType = getTailorDBTypeByName(types, e.target.value);
          if (!selectedType) {
            return;
          }
          props.onChange(selectedType);
        }}
      >
        {types.map((type) => (
          <option key={type.name} value={type.name}>
            {type.name}
          </option>
        ))}
      </NativeSelectField>
    </NativeSelectRoot>
  );
};

type ContentContainerProps = {
  workspace: WorkspaceResult["workspace"];
  tailorDBTypes: TailorDBTypesResult["tailordbTypes"];
};

export const ContentContainer = (props: ContentContainerProps) => {
  const [drawerOpened, setDrawerOpened] = useState(false);

  return (
    <ReactFlowProvider>
      <Content
        containerProps={props}
        onNewTable={() => setDrawerOpened(true)}
      />
      <NewTableDrawer
        drawerOpened={drawerOpened}
        setDrawerOpened={setDrawerOpened}
        tailorDBTypes={props.tailorDBTypes}
      />
    </ReactFlowProvider>
  );
};

const fieldTypes = {
  string: {
    label: "String",
  },
  uuid: {
    label: "UUID",
  },
  number: {
    label: "Number",
  },
  boolean: {
    label: "Boolean",
  },
  enum: {
    label: "Enum",
  },
  date: {
    label: "Date",
  },
  time: {
    label: "Time",
  },
  dateTime: {
    label: "DateTime",
  },
} as const;

type TableField = {
  name: string;
  description: string;
  type: keyof typeof fieldTypes;
  required: false | "on";
  index: false | "on";
  unique: false | "on";
  foreignKey?: string;
  foreignKeyType?: string;
  sourceID?: string;
  hasSource?: boolean;
  allowedValues?: Array<{
    value: string;
    description: string;
  }>;
};

const emptyField = {
  name: "",
  description: "",
  type: "string",
  required: false,
  index: false,
  unique: false,
} as const;

type FormFields = {
  name: string;
  fields: Array<TableField>;
};

const NewTableDrawer = (props: {
  drawerOpened: boolean;
  setDrawerOpened: (opened: boolean) => void;
  tailorDBTypes: TailorDBTypesResult["tailordbTypes"];
}) => {
  const form = useForm<FormFields>();
  const { control, register, watch, handleSubmit } = form;
  const fieldsOp = useFieldArray({
    control: control,
    name: "fields",
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
                      <Input placeholder="Description" />
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
          </Stack>
        </DrawerBody>
        <DrawerFooter borderColor={"gray.200"} borderTopWidth={"1px"}>
          <Flex flexGrow={1}>
            <Button
              width="100%"
              disabled={fieldsOp.fields.length === 0}
              onClick={handleSubmit((data) => console.log(data))}
            >
              Create
            </Button>
          </Flex>
        </DrawerFooter>
      </DrawerContent>
    </DrawerRoot>
  );
};

const FieldSpecificForm = (props: {
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

type ContentProps = {
  containerProps: ContentContainerProps;
  onNewTable: () => void;
};

const Content = (props: ContentProps) => {
  const { workspace, tailorDBTypes } = props.containerProps;
  const initialTailorDBType = tailorDBTypes[0];
  const [currentType, setCurrentType] = useState<TailorDBType | null>(
    getTailorDBTypeByName(tailorDBTypes, initialTailorDBType.name)
  );
  const {
    schemaViewerPaneWidth,
    setSchemaViewerPaneWidth,
    isSchemaViewerInitialized,
    setSchemaViewerInitialized,
  } = useSchemaViewerResizer();

  return (
    <Stack gap={0} height="100vh">
      <Flex p={2} justifyContent={"space-between"}>
        <HStack>
          <Heading fontWeight={"bold"}>TailorDB Editor</Heading>
          <Badge>
            <Link href="/workspace">{workspace.name}</Link>
          </Badge>
        </HStack>
      </Flex>
      <HStack gap={0} borderTop={"1px solid #e2e2e2"} height="100%">
        <Allotment
          onChange={([pane1Width]) => setSchemaViewerPaneWidth(pane1Width)}
        >
          <Allotment.Pane preferredSize={"50%"}>
            <Box width={schemaViewerPaneWidth} height={"calc(100vh - 48px)"}>
              <SchemaViewer
                types={tailorDBTypes}
                onNewTable={props.onNewTable}
                onInitialized={() => setSchemaViewerInitialized(true)}
                onTableClicked={(typeName) => {
                  setCurrentType(
                    getTailorDBTypeByName(tailorDBTypes, typeName)
                  );
                }}
              />
            </Box>
          </Allotment.Pane>
          <Allotment.Pane>
            {isSchemaViewerInitialized ? (
              <>
                <Flex p={2} justifyContent={"space-between"}>
                  <Box width="300px" resize="both">
                    <TypeSelector
                      currentType={currentType}
                      onChange={setCurrentType}
                      types={tailorDBTypes}
                    />
                  </Box>
                  <Box>
                    <Button size="xs">Add column</Button>
                  </Box>
                </Flex>
                <Flex>
                  <TailorDBTable
                    data={currentType?.schema.fields || {}}
                    handlers={{
                      onClickSourceType: (typeName) => {
                        setCurrentType(
                          getTailorDBTypeByName(tailorDBTypes, typeName)
                        );
                      },
                    }}
                  />
                </Flex>
              </>
            ) : (
              <Flex p={3}>
                <Text>Initializing...</Text>
              </Flex>
            )}
          </Allotment.Pane>
        </Allotment>
      </HStack>
    </Stack>
  );
};

/**
 * A hook to prevent React Flow warning (https://reactflow.dev/error#004)
 *
 * Background of this hook is that ReactFlow requires static width and height for the container element
 * However, we are using Allotment that has dynamic width and height before its children are rendered,
 * so this hook provides a set of functions that helps us update the width of the container element dynamically.
 */
const useSchemaViewerResizer = () => {
  const reactFlow = useReactFlow();

  // "0px" results in React Flow warning (https://reactflow.dev/error#004)
  // so for the initial time, we just set it to static "1px"
  const [schemaViewerPaneWidth, setSchemaViewerPaneWidth] = useState("1px");

  // `TailorDBTable` will be rendered at first with allotment, but it causes flash in rendering the page
  // so we need to wait for the schema viewer to be initialized
  const [isSchemaViewerInitialized, setSchemaViewerInitialized] =
    useState(false);

  // Debounce the resize event to prevent unnecessary re-renders
  // 25ms is the minimum time that looks working nice for the debounce, but ok to increase/decrease it
  const debouncedResize = debounce((value: number | undefined) => {
    if (value) {
      setSchemaViewerPaneWidth(Math.round(value) + "px");
    }
  }, 25);

  // fitView should be called after the schemaViewerPaneWidth has been updated
  // it does not work if called simultaneously with setSchemaViewerPaneWidth
  useEffect(() => {
    reactFlow.fitView();
  }, [schemaViewerPaneWidth]);

  return {
    schemaViewerPaneWidth,
    setSchemaViewerPaneWidth: debouncedResize,
    isSchemaViewerInitialized,
    setSchemaViewerInitialized,
  };
};
