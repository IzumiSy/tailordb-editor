import {
  fieldTypes,
  isFieldType,
  TailorDBSchemaField,
  TailorDBSchemaFields,
} from "@/app/types";
import {
  Table,
  Badge,
  HStack,
  Box,
  Stack,
  Input,
  Select,
  NativeSelect,
} from "@chakra-ui/react";
import { LuArrowDownUp, LuArrowDown, LuArrowUp } from "react-icons/lu";
import {
  PopoverBody,
  PopoverContent,
  PopoverRoot,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DataListRoot, DataListItem } from "@/components/ui/data-list";
import {
  CellContext,
  ColumnFiltersState,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  Header,
  RowData,
  useReactTable,
} from "@tanstack/react-table";
import { memo, useMemo, useState } from "react";
import { FcOk } from "react-icons/fc";

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData extends RowData, TValue> {
    filterVariant?: "select" | "boolean";
    filterItems?: string[];
  }
}

const checkBoxColumn = (header: string) => {
  return {
    header: () => header,
    cell: (cell: CellContext<TailorDBSchemaField, unknown>) =>
      cell.getValue() && <FcOk />,
    enableResizing: false,
    meta: {
      filterVariant: "boolean",
    },
  } as const;
};

export const colorsMap = {
  uuid: "black",
  enum: "yellow",
  nested: "yellow",
  string: "green",
  boolean: "orange",
  float: "blue",
  integer: "blue",
  datetime: "purple",
  date: "purple",
  time: "purple",
} as const;

const TypeRenderer = (props: {
  cell: CellContext<TailorDBSchemaField, string>;
  onClickSourceType: (typeName: string) => void;
}) => {
  const { cell } = props;
  const typeName = cell.getValue();
  const [open, setOpen] = useState(false);

  switch (typeName) {
    case "uuid":
    case "string":
    case "boolean":
    case "date":
    case "datetime":
    case "float":
    case "integer": {
      return (
        <Badge colorPalette={colorsMap[typeName]}>
          {fieldTypes[typeName].label}
        </Badge>
      );
    }
    case "nested": {
      return (
        <Badge
          css={{ cursor: "pointer" }}
          variant="outline"
          colorPalette={colorsMap[typeName]}
        >
          {fieldTypes[typeName].label}
        </Badge>
      );
    }
    case "enum": {
      return (
        <PopoverRoot open={open} onOpenChange={(e) => setOpen(e.open)}>
          <PopoverTrigger asChild>
            <Badge
              css={{ cursor: "pointer" }}
              variant="outline"
              colorPalette={colorsMap[typeName]}
            >
              Enum
            </Badge>
          </PopoverTrigger>
          <PopoverContent>
            <PopoverBody>
              <DataListRoot>
                {cell.row.original.allowedValues?.map(
                  ({ value, description }, index) => (
                    <DataListItem
                      key={index}
                      label={<Badge>{value}</Badge>}
                      value={description}
                    />
                  )
                )}
              </DataListRoot>
            </PopoverBody>
          </PopoverContent>
        </PopoverRoot>
      );
    }
    default: {
      const sourceID = cell.row.original.sourceId;
      if (sourceID) {
        return (
          <Badge
            css={{ cursor: "pointer" }}
            variant="outline"
            onClick={() => {
              props.onClickSourceType(typeName);
            }}
          >
            Source: {typeName}
          </Badge>
        );
      }

      return typeName;
    }
  }
};

const columnHelper = createColumnHelper<TailorDBSchemaField>();
const buildColumns = (props: {
  data: TailorDBSchemaFields;
  onClickSourceType: (typeName: string) => void;
}) => [
  columnHelper.accessor("name", {
    header: () => "Name",
  }),
  columnHelper.accessor("type", {
    header: () => "Type",
    cell: (cell) => <TypeRenderer {...props} cell={cell} />,
    meta: {
      filterVariant: "select",
      filterItems: Object.keys(fieldTypes),
    },
    filterFn: "equalsString",
    sortingFn: (a, b, columnID) => {
      const aTypeValue: string = a.getValue(columnID);
      const bTypeValue: string = b.getValue(columnID);
      const aName = isFieldType(aTypeValue) ? aTypeValue : "";
      const bName = isFieldType(bTypeValue) ? bTypeValue : "";
      return aName.localeCompare(bName ?? "") ?? 0;
    },
  }),
  columnHelper.accessor("description", {
    header: () => "Description",
  }),
  columnHelper.accessor("foreignKey", {
    header: () => "Foreign Key",
    cell: (cell) => {
      const foreignKey = cell.getValue();
      const typeName = cell.row.original.foreignKeyType;
      if (foreignKey && typeName) {
        return (
          <Badge
            css={{ cursor: "pointer" }}
            variant="outline"
            onClick={() => {
              props.onClickSourceType(typeName);
            }}
          >
            {typeName}
          </Badge>
        );
      }
    },
    filterFn: (cell, columnID, filterValue) => {
      const typeName = cell.original.foreignKeyType;
      return (
        typeName?.toLowerCase()?.includes(filterValue.toLowerCase()) ?? false
      );
    },
    sortingFn: (a, b) => {
      const aTypeName = a.original.foreignKeyType;
      const bTypeName = b.original.foreignKeyType;
      return aTypeName?.localeCompare(bTypeName ?? "") ?? 0;
    },
  }),
  columnHelper.accessor("required", checkBoxColumn("Required")),
  columnHelper.accessor("index", checkBoxColumn("Index")),
  columnHelper.accessor("unique", checkBoxColumn("Unique")),
  columnHelper.accessor("array", checkBoxColumn("Array")),
];

type TailorDBTableProps = {
  data: TailorDBSchemaFields;
  handlers: {
    onClickSourceType: (typeName: string) => void;
  };
};

export const ReadonlyTableViewer = (props: TailorDBTableProps) => {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const { sortState, Sorter } = useSorter();
  const data = useMemo(
    () =>
      Object.keys(props.data).flatMap((fieldName) => {
        return [
          {
            ...props.data[fieldName],
            name: fieldName,
          },
        ];
      }),
    [props.data]
  );
  const columns = buildColumns({
    data: props.data,
    onClickSourceType: props.handlers.onClickSourceType,
  });
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      columnFilters,
      sorting: sortState,
    },
    onColumnFiltersChange: setColumnFilters,
  });

  return (
    <Table.ScrollArea width="100%" height="calc(100vh - 96px)">
      <Table.Root size="sm" variant="outline" stickyHeader overflowY={"scroll"}>
        <Table.Header>
          {table.getHeaderGroups().map((headerGroup) => (
            <Table.Row key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <Table.ColumnHeader
                  key={header.id}
                  backgroundColor={"bg.muted"}
                  style={{
                    width:
                      header.getSize() !== 150 ? header.getSize() : undefined,
                  }}
                >
                  <Stack>
                    <HStack>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                      <Sorter header={header} />
                    </HStack>
                    <ColumnFilterInput header={header} />
                  </Stack>
                </Table.ColumnHeader>
              ))}
            </Table.Row>
          ))}
        </Table.Header>
        <Table.Body>
          {table.getRowModel().rows.map((row) => (
            <Table.Row key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <Table.Cell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </Table.Cell>
              ))}
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Table.ScrollArea>
  );
};

const ColumnFilterInput = (props: {
  header: Header<TailorDBSchemaField, unknown>;
}) => {
  const { header } = props;
  const meta = header.column.columnDef.meta;

  switch (meta?.filterVariant) {
    case "select": {
      return (
        <NativeSelect.Root size="sm">
          <NativeSelect.Field
            backgroundColor="white"
            onChange={(e) => {
              header.column.setFilterValue(e.target.value);
            }}
          >
            <option value="">-</option>
            {meta.filterItems?.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </NativeSelect.Field>
        </NativeSelect.Root>
      );
    }

    case "boolean": {
      return (
        <NativeSelect.Root size="sm">
          <NativeSelect.Field
            backgroundColor="white"
            onChange={(e) => {
              header.column.setFilterValue(
                e.target.value === "" ? undefined : e.target.value === "true"
              );
            }}
          >
            <option value="">-</option>
            <option value="true">True</option>
            <option value="false">False</option>
          </NativeSelect.Field>
        </NativeSelect.Root>
      );
    }

    default: {
      return (
        <Input
          onChange={(e) => {
            header.column.setFilterValue(e.target.value);
          }}
          size="xs"
          placeholder="Filter"
          backgroundColor="white"
        />
      );
    }
  }
};

const useSorter = () => {
  const [internalSortState, setSortingState] = useState<
    Record<string, "asc" | "desc" | null>
  >({});

  const sortState = useMemo(
    () =>
      Object.keys(internalSortState).flatMap((key) => {
        const value = internalSortState[key];
        if (!value) {
          return [];
        }

        return {
          id: key,
          desc: value === "desc",
        };
      }),
    [internalSortState]
  );

  const Sorter = memo(
    (props: { header: Header<TailorDBSchemaField, unknown> }) => {
      const stateValue = internalSortState[props.header.id];
      const valueMap = {
        asc: <LuArrowUp />,
        desc: <LuArrowDown />,
      } as const;

      return (
        <Box
          css={{
            cursor: "pointer",
          }}
          onClick={() => {
            setSortingState((state) => {
              return {
                ...state,
                [props.header.id]: state[props.header.id]
                  ? state[props.header.id] === "desc"
                    ? "asc"
                    : null
                  : "desc",
              };
            });
          }}
        >
          {stateValue ? valueMap[stateValue] : <LuArrowDownUp />}
        </Box>
      );
    }
  );

  return {
    sortState,
    Sorter,
  };
};
