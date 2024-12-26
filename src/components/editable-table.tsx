import { fieldTypes, FormFields, TableField } from "@/app/types";
import { Button, Flex, Input, NativeSelect, Table } from "@chakra-ui/react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { get, useFieldArray, useFormContext } from "react-hook-form";

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

const columnHelper = createColumnHelper<TableField>();
const useColumnBuilder = (props: { onDeleteRow: (index: number) => void }) => {
  const { register, formState } = useFormContext<FormFields>();

  return [
    columnHelper.display({
      id: "actions",
      header: () => "Actions",
      enableResizing: false,
      maxSize: 30,
      size: 30,
      cell: ({ row }) => (
        <Button
          size="xs"
          variant="outline"
          onClick={() => props.onDeleteRow(row.index)}
        >
          Delete
        </Button>
      ),
    }),
    columnHelper.accessor("name", {
      header: () => "Name",
      cell: ({ row }) => (
        <Input
          size="xs"
          variant="subtle"
          {...register(`fields.${row.index}.name`)}
        />
      ),
    }),
    columnHelper.accessor("description", {
      header: () => "Description",
      cell: ({ row }) => (
        <Input
          size="xs"
          variant="subtle"
          {...register(`fields.${row.index}.description`)}
        />
      ),
    }),
    columnHelper.accessor("type", {
      header: () => "Type",
      cell: ({ row }) => (
        <NativeSelect.Root size="sm" variant="subtle">
          <NativeSelect.Field
            {...register(`fields.${row.index}.type`, {
              required: true,
            })}
          >
            {Object.keys(fieldTypes).map((fieldTypeKey) => {
              const fieldType =
                fieldTypes[fieldTypeKey as keyof typeof fieldTypes];
              return (
                <option key={fieldTypeKey} value={fieldTypeKey}>
                  {fieldType.label}
                </option>
              );
            })}
          </NativeSelect.Field>
        </NativeSelect.Root>
      ),
    }),
    columnHelper.accessor("required", {
      header: () => "Required",
      cell: ({ row }) => {
        const field = register(`fields.${row.index}.required`);
        const defaultValue = get(formState.defaultValues, field.name);

        return (
          <Checkbox
            size="lg"
            variant="subtle"
            colorScheme="primary"
            defaultChecked={!!defaultValue}
            {...field}
          />
        );
      },
    }),
    columnHelper.accessor("index", {
      header: () => "Index",
      cell: ({ row }) => {
        const field = register(`fields.${row.index}.index`);
        const defaultValue = get(formState.defaultValues, field.name);

        return (
          <Checkbox
            size="lg"
            variant="subtle"
            colorScheme="primary"
            defaultChecked={!!defaultValue}
            {...field}
          />
        );
      },
    }),
  ];
};

export const EditableTableViewer = () => {
  const form = useFormContext<FormFields>();
  const fieldsOp = useFieldArray({
    control: form.control,
    name: "fields",
  });
  const columns = useColumnBuilder({
    onDeleteRow: (index) => {
      fieldsOp.remove(index);
    },
  });
  const table = useReactTable({
    data: fieldsOp.fields,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });
  const addEmptyRow = () => {
    fieldsOp.append(emptyField);
  };

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
      <Flex p={2} onClick={() => addEmptyRow()}>
        <Button
          size="xs"
          variant="ghost"
          justifyContent={"start"}
          width={"100%"}
        >
          Add new field ...
        </Button>
      </Flex>
    </Table.ScrollArea>
  );
};
