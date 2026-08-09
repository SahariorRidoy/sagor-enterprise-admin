"use client";

import Image from "next/image";
import { Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Product } from "@/types/Product";
import Link from "next/link";

interface ProductTableProps {
  products: Product[];
  onAction: (action: string, id: string) => void;
  activeFilter: string;
  startIndex?: number;
}

export default function ProductTable({
  products,
  onAction,
  activeFilter,
  startIndex = 1,
}: ProductTableProps) {
  // 🔹 Sorting and filtering logic
  const sortedProducts = (() => {
    switch (activeFilter) {
      case "On Sale":
        return products
          .filter(
            (p) =>
              p.productInfo?.salePrice &&
              Number(p.productInfo.salePrice) < Number(p.productInfo.price)
          )
          .sort(
            (a, b) =>
              Number(a.productInfo.salePrice) - Number(b.productInfo.salePrice)
          );

      case "Out of Stock":
        return products.filter((p) => p.productInfo?.quantity === 0);

      case "Featured Products":
        return products.filter(
          (p) =>
            p.brandAndCategories?.tags?.some(
              (tag) => tag.name?.toLowerCase() === "featured"
            ) ||
            p.description?.status?.toLowerCase() === "publish"
        );

      default:
        return [...products].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
        );
    }
  })();

  return (
    <div className="w-full overflow-x-auto">
      <Table className="min-w-[850px]">
        <TableHeader>
          <TableRow>
            <TableHead className="w-12 px-2 py-1 text-xs sm:text-sm">Select</TableHead>
            <TableHead className="w-12 px-2 py-1 text-xs sm:text-sm">No.</TableHead>
            <TableHead className="px-2 py-1 text-xs sm:text-sm">Product Name</TableHead>
            <TableHead className="px-2 py-1 text-xs sm:text-sm">Category</TableHead>
            <TableHead className="px-2 py-1 text-xs sm:text-sm">Stock</TableHead>
            <TableHead className="px-2 py-1 text-xs sm:text-sm">Price</TableHead>

            {/* ✅ Hide Wholesale column on "On Sale" tab */}
            {/* {activeFilter !== "On Sale" && (
              <TableHead className="px-2 py-1 text-xs sm:text-sm text-center">
                Wholesale Price
              </TableHead>
            )} */}

            <TableHead className="px-2 py-1 text-xs sm:text-sm">Created Date</TableHead>
            <TableHead className="px-2 py-1 text-xs sm:text-sm">Order</TableHead>
            <TableHead className="w-20 px-2 py-1 text-center text-xs sm:text-sm">Action</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {sortedProducts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={10} className="text-center py-4 text-gray-500">
                No Products Found
              </TableCell>
            </TableRow>
          ) : (
            sortedProducts.map((product, index) => {
              const info = product.productInfo || {};
              const hasSale = info.salePrice && info.salePrice < info.price;

              return (
                <TableRow key={product._id} className="hover:bg-gray-50">
                  <TableCell className="px-2 py-1">
                    <Checkbox value={product._id} />
                  </TableCell>

                  <TableCell className="px-2 py-1 text-xs sm:text-sm">
                    {startIndex + index}
                  </TableCell>

                  <TableCell className="px-2 py-1">
                    <div className="flex items-center gap-3">
                      {product.featuredImg ? (
                        <Image
                          src={product.featuredImg}
                          alt={product?.description?.name}
                          width={40}
                          height={40}
                          className="rounded-md object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 bg-gray-200 rounded-md" />
                      )}
                      <span className="font-medium text-sm truncate">
                        {product?.description?.name}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="px-2 py-1 text-xs sm:text-sm">
                    {product.brandAndCategories?.categories?.[0]?.name || "-"}
                  </TableCell>

                  <TableCell className="px-2 py-1 text-xs sm:text-sm">
                    {info.quantity ?? 0}
                  </TableCell>

                  {/* ✅ Regular + Sale Price Display */}
                  <TableCell className="px-2 py-1 text-sm">
                    {hasSale ? (
                      <div className="flex flex-col">
                        <span className="text-gray-400 line-through text-xs">
                          ৳{info.price}
                        </span>
                        <span className="text-red-600 font-semibold">
                          ৳{info.salePrice}
                        </span>
                      </div>
                    ) : (
                      <span className="font-semibold text-gray-800">
                        ৳{info.price}
                      </span>
                    )}
                  </TableCell>

                  {/* ✅ Show Wholesale column except on "On Sale" tab */}
                  {/* {activeFilter !== "On Sale" && (
                    <TableCell className="px-2 py-1 text-sm text-blue-600 font-medium text-center">
                      {info.wholeSalePrice ? `৳${info.wholeSalePrice}` : "—"}
                    </TableCell>
                  )} */}

                  <TableCell className="px-2 py-1 text-sm whitespace-nowrap">
                    {new Date(product.createdAt).toLocaleDateString()}
                  </TableCell>

                  <TableCell className="px-2 py-1 text-sm">
                    {product.description?.status}
                  </TableCell>

                  <TableCell className="px-2 py-1">
                    <div className="flex justify-center gap-2">
                      <Link href={`/admin/edit-product/${product._id}`}>
                        <Button variant="ghost" size="sm" className="p-1">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-1"
                        onClick={() => onAction("delete", product._id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
