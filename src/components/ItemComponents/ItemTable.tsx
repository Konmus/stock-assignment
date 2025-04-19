"use client";
import { useState } from "react";
import useSWR from "swr";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { fetcher } from "@/lib/fetcher";
import { Button } from "@/components/ui/button";

// Define item type based on schema
interface Item {
  id: string;
  name: string;
  category: "Electronics" | "Furniture" | "Clothing" | "Other";
  quantity: number;
  imageUrl?: string;
  price?: string;
  createdAt: string;
  updatedAt: string;
}

// Define columns
const columns: ColumnDef<Item>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => <span>{row.getValue("name")}</span>,
    enableSorting: true,
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => (
      <span
        className={`px-2 py-1 rounded-full text-xs ${
          row.getValue("category") === "Electronics"
            ? "bg-blue-100 text-blue-800"
            : row.getValue("category") === "Furniture"
              ? "bg-green-100 text-green-800"
              : row.getValue("category") === "Clothing"
                ? "bg-purple-100 text-purple-800"
                : "bg-gray-100 text-gray-800"
        }`}
      >
        {row.getValue("category")}
      </span>
    ),
    enableSorting: true,
  },
  {
    accessorKey: "quantity",
    header: "Quantity",
    cell: ({ row }) => <span>{row.getValue("quantity")}</span>,
    enableSorting: true,
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => (
      <span>{row.getValue("price") ? `$${row.getValue("price")}` : "N/A"}</span>
    ),
    enableSorting: true,
  },
  {
    accessorKey: "imageUrl",
    header: "Image",
    cell: ({ row }) => {
      const imageUrl = row.getValue("imageUrl") as string | undefined;
      const fullImageUrl = imageUrl
        ? `http://localhost:9000/item-photo/${imageUrl}`
        : undefined;
      return fullImageUrl ? (
        <img
          src={fullImageUrl}
          alt={row.getValue("name")}
          className="h-12 w-12 object-cover rounded"
        />
      ) : (
        <span>No Image</span>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => (
      <span>{new Date(row.getValue("createdAt")).toLocaleDateString()}</span>
    ),
    enableSorting: true,
  },
  {
    accessorKey: "updatedAt",
    header: "Updated At",
    cell: ({ row }) => (
      <span>{new Date(row.getValue("updatedAt")).toLocaleDateString()}</span>
    ),
    enableSorting: true,
  },
];

export function ItemTable() {
  const [openModal, setOpenModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState<Item | undefined>();
  const [isAdding, setIsAdding] = useState(false);
  const [isEditting, setIsEditting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch data with useSWR
  const { data: items, error } = useSWR<Item[]>("/api/item", fetcher, {
    suspense: true,
  });

  // Table state
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  // Initialize table
  const table = useReactTable({
    data: items || [],
    columns,
    state: { pagination },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="p-4 bg-white shadow rounded-lg">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center space-x-1">
                      <span>
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                      </span>
                      {header.column.getCanSort() && (
                        <span>
                          {{
                            asc: "↑",
                            desc: "↓",
                            none: "↕",
                          }[header.column.getIsSorted() as string] || "↕"}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                onClick={() => {
                  setOpenModal(true);
                  setSelectedRow(row.original);
                }}
                className="hover:bg-gray-50 cursor-pointer"
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex space-x-2">
          <Button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded disabled:opacity-50"
          >
            Previous
          </Button>
          <Button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded disabled:opacity-50"
          >
            Next
          </Button>
        </div>
        <div className="text-sm text-gray-700">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </div>
      </div>
    </div>
  );
}
