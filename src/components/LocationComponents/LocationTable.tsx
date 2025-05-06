"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  BookOpen,
  Clipboard,
  MapPin,
  Package,
  Pencil,
  Plus,
  Search,
  Trash,
} from "lucide-react";
import useSWR from "swr";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetcher } from "@/lib/fetcher";
import { TLocation } from "@/lib/db/schema";
import { LocationModal } from "./LocationModal";
import { PhotoProvider, PhotoView } from "react-photo-view";

// Fetcher function for SWR

export default function LocationsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editLocation, setEditLocation] = useState<TLocation>();

  // Construct SWR key based on search query
  const swrKey = searchQuery
    ? `/api/location?name=${encodeURIComponent(searchQuery)}`
    : "/api/location";

  // Fetch locations using useSWR
  const {
    data: locations,
    error,
    isLoading,
  } = useSWR<TLocation[]>(swrKey, fetcher, { suspense: true });
  const columnHelper = createColumnHelper<TLocation>();

  // Define table columns
  const columns = useMemo(
    () => [
      columnHelper.accessor("imageUrl", {
        header: "Image",
        cell: ({ row }) => {
          const imageUrl = row.getValue("imageUrl") as string | undefined;
          const fullImageUrl = imageUrl
            ? `http://${process.env.NEXT_PUBLIC_BASE_URL}:9000/item-photo/${imageUrl}`
            : undefined;
          return fullImageUrl ? (
            <>
              <PhotoProvider>
                <PhotoView src={fullImageUrl}>
                  <Image
                    src={fullImageUrl}
                    alt={row.getValue("name")}
                    height={48}
                    width={48}
                    className="h-12 w-12 object-cover rounded"
                  />
                </PhotoView>
              </PhotoProvider>
            </>
          ) : (
            <span>No Image</span>
          );
        },
      }),
      columnHelper.accessor("name", {
        header: "Name",
        cell: (info) => <span className="font-medium">{info.getValue()}</span>,
      }),
      columnHelper.accessor("description", {
        header: "Description",
        cell: (info) => (
          <span className="text-muted-foreground">
            {info.getValue() || "No description"}
          </span>
        ),
      }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEditLocation(row.original);
                setIsAddModalOpen(true);
              }}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </div>
        ),
      }),
    ],
    [],
  );

  // Initialize table
  const table = useReactTable({
    data: locations ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (error) {
    return <div>Error loading locations</div>;
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <div className="ml-auto flex items-center gap-4">
        <form className="relative hidden md:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search locations..."
            className="w-64 rounded-lg bg-background pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
      </div>
      <div className="flex flex-1">
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          {isLoading ? (
            <div>Loading locations...</div>
          ) : (
            <div className="rounded-md border">
              <table className="w-full text-sm">
                <thead>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          className="px-6 py-3 text-left font-medium"
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {table.getRowModel().rows.map((row) => (
                    <tr key={row.id} className="border-t">
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-6 py-4">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
      {isAddModalOpen && (
        <LocationModal
          isModalOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          data={editLocation}
        />
      )}
    </div>
  );
}
