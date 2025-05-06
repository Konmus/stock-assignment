"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Clipboard,
  MapPin,
  Package,
  Pencil,
  Plus,
  Search,
} from "lucide-react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { fetcher } from "@/lib/fetcher";
import { TCategory } from "@/lib/db/schema";
import { CategoryModal } from "./CategoryModal";

// Fetcher function for SWR (already defined in your codebase)

export default function CategoriesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<TCategory>();

  // Fetch categories using useSWR
  const {
    data: categories,
    error,
    isLoading,
  } = useSWR<TCategory[]>("/api/category", fetcher, {
    suspense: true,
  });

  // Filter categories based on search query
  const filteredCategories = categories?.filter(
    (category) =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (category.description || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()),
  );

  if (error) {
    return <div>Error loading categories</div>;
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <div className="ml-auto flex items-center gap-4">
        <form className="relative hidden md:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search categories..."
            className="w-64 rounded-lg bg-background pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
      </div>
      <div className="flex flex-1">
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          <div className="flex items-center justify-between"></div>

          {isLoading ? (
            <div>Loading categories...</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredCategories?.map((category) => (
                <Card key={category.id}>
                  <CardHeader>
                    <CardTitle>{category.name}</CardTitle>
                    <CardDescription>
                      {category.description || "No description"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {category.itemCount} item
                      {category.itemCount > 1 ? "s" : ""} in this category
                    </p>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditCategory(category);
                        setIsAddModalOpen(true);
                      }}
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
      {isAddModalOpen && (
        <CategoryModal
          isModalOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          data={editCategory}
        />
      )}
    </div>
  );
}
