"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  Package,
  Pencil,
  Plus,
  Save,
  Trash,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TStock, TStockItem } from "@/lib/db/schema";
import { fetcher } from "@/lib/fetcher";
import useSWR from "swr";
import { AddStockModal, ItemData } from "./AddStockModal";

export default function ItemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const itemId = Number(params.id);
  const { data } = useSWR<TStockItem>(`/api/item/${params.id}`, fetcher, {
    suspense: true,
  });
  const item = data;
  const itemStock = data?.stock;

  const [activeTab, setActiveTab] = useState("details");
  const [isAddStock, setIsAddStock] = useState(false);
  const [isEditStock, setIsEditStock] = useState(false);
  const [selectedStock, setSelectedStock] = useState<ItemData>();
  console.log(itemStock);

  return (
    <div className="flex min-h-screen w-full flex-col">
      <div className="ml-auto flex items-center gap-4"></div>
      <div className="flex flex-1">
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/item")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <h1 className="text-2xl font-bold tracking-tight">{item?.name}</h1>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="details">Item Details</TabsTrigger>
              <TabsTrigger value="stock">
                Stock Locations ({data?.stock.length ?? 0})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="space-y-4">
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                    <CardDescription>
                      Essential details about this inventory item
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Item Name</Label>
                      <div className="text-sm">{item?.name}</div>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="quantity">Quantity</Label>
                      <div className="text-sm">{item?.quantity}</div>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="category">Category</Label>
                      <div className="text-sm">{data?.category?.name}</div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Additional Details</CardTitle>
                    <CardDescription>
                      More information about this inventory item
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="image">Image</Label>
                      <div className="text-sm">
                        {item?.imageUrl ? (
                          <img
                            src={`http://${process.env.NEXT_PUBLIC_BASE_URL}:9000/item-photo/${item.imageUrl}`}
                            alt={item?.name}
                            className="h-24 w-24 object-cover rounded"
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder-image.png";
                            }}
                          />
                        ) : (
                          "No image"
                        )}
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="supplier">Supplier</Label>
                      <div className="text-sm">
                        {item?.supplier || "No supplier"}
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="price">Price ($)</Label>
                      <div className="text-sm">
                        {item?.price != null
                          ? `$${item?.price.toFixed(2)}`
                          : "No price"}
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="createdAt">Created At</Label>
                      <div className="text-sm">
                        {new Date(
                          item?.createdAt as string,
                        ).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="updatedAt">Updated At</Label>
                      <div className="text-sm">
                        {new Date(
                          item?.updatedAt as string,
                        ).toLocaleDateString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="stock">
              <Card>
                <CardHeader>
                  <CardTitle>Stock Locations</CardTitle>
                  <CardDescription>
                    Inventory stock across different locations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Location</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Last Updated</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {itemStock?.map((stock) => (
                        <TableRow key={stock.id}>
                          <TableCell className="font-medium">
                            {stock.location.name}
                          </TableCell>
                          <TableCell>{stock.quantity}</TableCell>
                          <TableCell>
                            <div
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                stock.status === "Available"
                                  ? "bg-green-100 text-green-800"
                                  : stock.status === "Lost"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : stock.status === "In Use"
                                      ? "bg-blue-100 text-blue-800"
                                      : stock.status === "Damaged"
                                        ? "bg-red-100 text-red-800"
                                        : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {stock.status}
                            </div>
                          </TableCell>
                          <TableCell>
                            {new Date(
                              stock?.lastUpdated as string,
                            ).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setIsEditStock(true);
                                setSelectedStock(stock);
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {itemStock?.length === 0 && (
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            className="text-center py-4 text-muted-foreground"
                          >
                            No stock locations found. Add stock to get started.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div>
                    <span className="text-sm font-medium">
                      Total Quantity:{" "}
                      {itemStock?.reduce((acc, cur) => acc + cur.quantity, 0) ??
                        0}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsAddStock(true)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Stock
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
      {isAddStock && (
        <AddStockModal
          isModalOpen={isAddStock}
          onClose={() => setIsAddStock(false)}
        />
      )}
      {isEditStock && (
        <AddStockModal
          isModalOpen={isEditStock}
          onClose={() => setIsEditStock(false)}
          data={selectedStock}
        />
      )}
    </div>
  );
}
