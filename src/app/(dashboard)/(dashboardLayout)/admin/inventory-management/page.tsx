"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import InventoryStatsCard from "@/components/inventory-management/InventoryStatsCard";
import InventorySearchBar from "@/components/inventory-management/InventorySearchBar";
import ProductTable from "@/components/inventory-management/ProductTable";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  selectProducts,
  setProducts,
} from "@/redux/featured/products/productSlice";
import { Product } from "@/types/Product";
import {
  useGetAllProductsQuery,
  useProductInventoryQuery,
} from "@/redux/featured/products/productsApi";
import Link from "next/link";
import PaginationControls from "@/components/inventory/PaginationControls";

export interface IInventoryStats {
  totalProducts: number;
  totalStock: number;
  lowStockItems: number;
  outOfStock: number;
  totalValue: number;
}

const InventoryManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [stockFilter, setStockFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data, isLoading, refetch } = useGetAllProductsQuery({
    searchTerm,
    page: 1, // You can ignore this if backend pagination not used
    limit: 50000,
  });

  const {
    data: inventoryStats,
    isLoading: LoadingInventory,
    refetch: refetchInventory,
  } = useProductInventoryQuery({});

  const dispatch = useAppDispatch();
  const products = useAppSelector(selectProducts);

  // ✅ Update Redux store
  useEffect(() => {
    if (data) dispatch(setProducts(data as Product[]));
  }, [data, dispatch]);

  // ✅ Filter products (stock + search)
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch = p.description?.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchStock =
        stockFilter === "In Stock"
          ? p.productInfo.quantity > 0
          : stockFilter === "Out of Stock"
          ? p.productInfo.quantity === 0
          : true;
      return matchSearch && matchStock;
    });
  }, [products, searchTerm, stockFilter]);

  // ✅ Client-side pagination
  const totalItems = filteredProducts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProducts, currentPage]);

  // ✅ Display item number range
  const startItemNumber = (currentPage - 1) * itemsPerPage + 1;
  const endItemNumber = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="space-y-6 py-6">
      {/* Add Product Button */}
      <div className="flex justify-end gap-2">
        <Button 
          onClick={() => {
            const link = document.createElement('a');
            link.href = '/api/v1/product/export/catalog-csv';
            link.download = 'product-catalog.csv';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }}
          variant="outline"
          className="border-gray-800 text-gray-800 hover:bg-gray-800 hover:text-white"
        >
          Export CSV
        </Button>
        <Link href={"/admin/add-new-product"}>
          <Button className="bg-gray-800 hover:bg-gray-900 text-white">
            + Add Product
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <InventoryStatsCard
        inventoryStats={inventoryStats}
        isLoading={LoadingInventory}
      />

      {/* Inventory Management Section */}
      <div className="bg-white rounded-lg p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Inventory Management</h2>
          <p className="text-gray-600 text-sm">
            Track and manage your product inventory
          </p>
        </div>

        {/* Search and Stock Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
          <InventorySearchBar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />
          <select
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            value={stockFilter}
            onChange={(e) => {
              setStockFilter(e.target.value);
              setCurrentPage(1); // reset to first page
            }}
          >
            <option value="All">All</option>
            <option value="In Stock">In Stock</option>
            <option value="Out of Stock">Out of Stock</option>
          </select>
        </div>

        {/* Product Table */}
        <ProductTable
          products={paginatedProducts}
          isLoading={isLoading}
          refetch={refetch}
          InventoryStatusRefetch={refetchInventory}
        />

        {/* Pagination Controls */}
        {!isLoading && totalPages > 1 && (
          <>
            <div className="p-4 text-sm text-gray-600 border-t">
              Showing {startItemNumber} - {endItemNumber} of {totalItems}{" "}
              products
            </div>

            <PaginationControls
              currentPage={currentPage}
              totalItems={totalItems}
              totalPages={totalPages}
              itemsPerPage={itemsPerPage}
              startIndex={startItemNumber} // ✅ ADD THIS LINE
              onPageChange={(page) => {
                setCurrentPage(page);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default InventoryManagement;
