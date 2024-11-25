import { TailorDBSchemaField, TailorDBSchemaFields } from "@/app/types";
import { Table, Badge } from "@chakra-ui/react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo } from "react";

const columnHelper = createColumnHelper<TailorDBSchemaField>();
const buildColumns = (props: {
  onClickSourceType: (typeName: string) => void;
}) => [
  columnHelper.accessor("name", {
    header: () => "Name",
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
  columnHelper.accessor("required", {
    header: () => "Required",
  }),
  columnHelper.accessor("description", {
    header: () => "Description",
  }),
];

type TailorDBTableProps = {
  data: TailorDBSchemaFields;
  handlers: {
    onClickSourceType: (typeName: string) => void;
  };
};

export const TailorDBTable = (props: TailorDBTableProps) => {
  const data = useMemo(
    () =>
      Object.keys(props.data).map((fieldName) => ({
        ...props.data[fieldName],
        name: fieldName,
      })),
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
    <Table.Root size="sm" variant="outline">
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
  );
};
