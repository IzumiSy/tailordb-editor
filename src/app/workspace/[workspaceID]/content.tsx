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
import { useEffect, useState, useTransition } from "react";
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
import { useNewTableForm } from "./new-table";
import { createTableAction } from "@/actions/table";

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
  namespaceName: string;
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
        namespaceName={props.workspace.name}
        workspace={props.workspace}
        tailorDBTypes={props.tailorDBTypes}
      />
    </ReactFlowProvider>
  );
};

const NewTableDrawer = (props: {
  drawerOpened: boolean;
  setDrawerOpened: (opened: boolean) => void;
  namespaceName: string;
  workspace: WorkspaceResult["workspace"];
  tailorDBTypes: TailorDBTypesResult["tailordbTypes"];
}) => {
  const { fields, register, handleSubmit, renderComponents } =
    useNewTableForm();
  const [isCreatingTable, startCreatingTable] = useTransition();
  const createTable = handleSubmit((data) => {
    startCreatingTable(async () => {
      await createTableAction(props.workspace.id, props.namespaceName, data);
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
          <Flex flexGrow={1}>
            <Button
              width="100%"
              disabled={fields.length === 0 || isCreatingTable}
              onClick={createTable}
            >
              Create
            </Button>
          </Flex>
        </DrawerFooter>
      </DrawerContent>
    </DrawerRoot>
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
