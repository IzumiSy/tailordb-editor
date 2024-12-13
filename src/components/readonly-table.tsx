import { TailorDBSchemaField, TailorDBSchemaFields } from "@/app/types";
import { Table, Badge } from "@chakra-ui/react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo } from "react";
import { FcOk } from "react-icons/fc";

const columnHelper = createColumnHelper<TailorDBSchemaField>();
const buildColumns = (props: {
  onClickSourceType: (typeName: string) => void;
}) => [
  columnHelper.accessor("name", {
    header: () => "Name",
  }),
  columnHelper.accessor("description", {
    header: () => "Description",
  }),
  columnHelper.accessor("type", {
    header: () => "Type",
    cell: (cell) => {
      const typeName = cell.getValue();

      switch (typeName) {
        case "uuid":
        case "string":
        case "boolean":
        case "datetime":
        case "float":
        case "integer":
          return <Badge>{typeName}</Badge>;
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
                {typeName}
              </Badge>
            );
          }

          return typeName;
        }
      }
    },
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
  }),
  columnHelper.accessor("required", {
    header: () => "Required",
    cell: (cell) => {
      const required = cell.getValue();
      return required && <FcOk />;
    },
    enableResizing: false,
  }),
];

type TailorDBTableProps = {
  data: TailorDBSchemaFields;
  handlers: {
    onClickSourceType: (typeName: string) => void;
  };
};

export const ReadonlyTableViewer = (props: TailorDBTableProps) => {
  const data = useMemo(
    () =>
      Object.keys(props.data).flatMap((fieldName) => {
        if (["createdAt", "updatedAt"].includes(fieldName)) {
          return [];
        }

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
    onClickSourceType: props.handlers.onClickSourceType,
  });
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Table.ScrollArea width="100%">
      <Table.Root size="sm" variant="outline" stickyHeader>
        <Table.Header>
          {table.getHeaderGroups().map((headerGroup) => (
            <Table.Row key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <Table.ColumnHeader key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
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
