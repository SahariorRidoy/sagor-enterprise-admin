"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CategoryCards } from "@/components/categorise/CategoryCards";
import { FilterBar } from "@/components/categorise/FilterTabs";
import HeaderActions from "@/components/categorise/HeaderActions";
import ProductTable from "@/components/categorise/ProductTable";
import PaginationControls from "@/components/categorise/PaginationControls";
import {
  useDeleteProductMutation,
  useGetAllProductsQuery,
} from "@/redux/featured/products/productsApi";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import Swal from "sweetalert2";
import {
  selectProducts,
  setProducts,
} from "@/redux/featured/products/productSlice";
import { Product } from "@/types/Product";
import { useGetAllCategoriesQuery } from "@/redux/featured/categories/categoryApi";
import {
  selectCategories,
  setCategories,
} from "@/redux/featured/categories/categorySlice";
import { ICategory } from "@/types/Category";
import { useRouter } from "next/navigation";

const CategoryPage = () => {
  const {
    data: allProducts,
    isLoading: ProductsLoading,
    refetch,
  } = useGetAllProductsQuery({ page: 1, limit: 50000 });
  const { data: allCategories, isLoading: CategoriesLoading } =
    useGetAllCategoriesQuery();
  const [deleteProduct] = useDeleteProductMutation();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const products = useAppSelector(selectProducts);
  const categories = useAppSelector(selectCategories);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All Product");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );
  const itemsPerPage = 10;

  // Load products & categories
  useEffect(() => {
    if (allCategories) dispatch(setCategories(allCategories as ICategory[]));
    if (allProducts) dispatch(setProducts(allProducts as Product[]));
  }, [allCategories, allProducts, dispatch]);

  // 🔹 Filtered products for tab counts (category aware)
  const filteredProductsForCount = useMemo(() => {
    return products.filter((p) => {
      if (p.description?.status?.toLowerCase() !== "publish") return false;
      if (
        selectedCategoryId &&
        !p.brandAndCategories?.categories?.some(
          (cat) => cat._id === selectedCategoryId
        )
      )
        return false;
      return true;
    });
  }, [products, selectedCategoryId]);

  // 🔹 Dynamic filter tabs
  // 🔹 Filter tabs with dynamic counts
  // 🔹 Filter tabs with dynamic counts
  const filterTabs = useMemo(
    () => [
      {
        name: "All Product",
        count: filteredProductsForCount.length || 0,
        active: activeFilter === "All Product",
      },
      {
        name: "On Sale",
        count: filteredProductsForCount.filter(
          (p) =>
            p.productInfo?.salePrice &&
            Number(p.productInfo.salePrice) > 0 &&
            p.productInfo?.quantity > 0 // ✅ only in stock
        ).length,
        active: activeFilter === "On Sale",
      },
      {
        name: "Out of Stock",
        count: filteredProductsForCount.filter(
          (p) => p.productInfo?.quantity === 0
        ).length,
        active: activeFilter === "Out of Stock",
      },
    ],
    [activeFilter, filteredProductsForCount]
  );

  // 🔹 Filtered products for table (category + filter + search)
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (p.description?.status?.toLowerCase() !== "publish") return false;

      if (
        selectedCategoryId &&
        !p.brandAndCategories?.categories?.some(
          (cat) => cat._id === selectedCategoryId
        )
      )
        return false;

      // ✅ On Sale filter: salePrice > 0 && quantity > 0
      if (
        activeFilter === "On Sale" &&
        !(
          p.productInfo?.salePrice &&
          Number(p.productInfo.salePrice) > 0 &&
          p.productInfo?.quantity > 0
        )
      )
        return false;

      if (activeFilter === "Out of Stock" && p.productInfo?.quantity !== 0)
        return false;

      if (
        searchQuery.trim() &&
        !p.description?.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
        return false;

      return true;
    });
  }, [products, activeFilter, searchQuery, selectedCategoryId]);

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProducts, currentPage]);

  const startItemNumber = (currentPage - 1) * itemsPerPage + 1;

  useEffect(() => {
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    if (currentPage > totalPages && totalPages > 0) setCurrentPage(1);
  }, [filteredProducts.length, currentPage]);

  const handleProductAction = (action: string, id: string) => {
    if (action === "delete") {
      Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!",
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            const res = await deleteProduct(id).unwrap();
            Swal.fire("Deleted!", `${res.message}`, "success");
            refetch();
          } catch (error) {
            Swal.fire(
              "Error!",
              "Something went wrong while deleting.",
              "error"
            );
            console.error(error);
          }
        }
      });
    }
    if (action === "edit") {
      router.push(`/admin/edit-product/${id}`);
    }
  };

  const handleExportCSV = () => {
    const headers = "id,title,description,availability,condition,price,link,image_link,brand,google_product_category,fb_product_category,quantity_to_sell_on_facebook,sale_price,sale_price_effective_date,item_group_id,gender,color,size,age_group,material,pattern,shipping,shipping_weight,video[0].url,video[0].tag[0],gtin,product_tags[0],product_tags[1],style[0]";
    
    const rows = filteredProducts.map((p) => {
      const fields = [
        p._id || "",
        p.description?.name || "",
        (p.description?.description || "").replace(/<[^>]*>/g, ""),
        p.productInfo?.quantity > 0 ? "in stock" : "out of stock",
        "new",
        `${p.productInfo?.price || 0}.00 BDT`,
        `https://sagorenterprise.com.bd/product/${p.description?.slug || p._id}`,
        p.gallery?.[0] || p.featuredImg || "",
        p.brandAndCategories?.brand?.name || "",
        p.brandAndCategories?.categories?.[0]?.name || "",
        p.brandAndCategories?.categories?.[0]?.name || "",
        p.productInfo?.quantity || 0,
        `${p.productInfo?.salePrice || 0}.00 BDT`,
        "2025-01-01T00:00+06:00/2025-12-31T23:59+06:00",
        `group_${p._id}`,
        "unisex",
        "Multi",
        "Standard",
        "adult",
        "Premium Quality",
        "Solid",
        "BD::Cash on Delivery:0.00 BDT",
        "10x10x10 cm",
        "",
        "sweet dring",
        p.productInfo?.sku || "",
        "sweet dring",
        "",
        "Modern"
      ];
      return fields.map(f => `"${String(f).replace(/"/g, '""')}"`).join(",");
    });

    const csv = "\uFEFF" + [headers, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `products-catalog-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-2 md:p-6">
      <div className="w-full space-y-6">
        <HeaderActions onExportCSV={handleExportCSV} />

        {CategoriesLoading ? (
          <span>Loading...</span>
        ) : (
          <CategoryCards
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            onCategoryClick={(id) => {
              setSelectedCategoryId(id || null);
              setCurrentPage(1);
            }}
          />
        )}

        <FilterBar
          tabs={filterTabs}
          activeFilter={activeFilter}
          setActiveFilter={(filter) => {
            setActiveFilter(filter);
            setCurrentPage(1);
          }}
          searchQuery={searchQuery}
          setSearchQuery={(query) => {
            setSearchQuery(query);
            setCurrentPage(1);
          }}
        />

        <Card>
          <CardContent className="p-0">
            {ProductsLoading ? (
              <span>Loading....</span>
            ) : filteredProducts.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                Product Not Found
              </div>
            ) : (
              <ProductTable
                products={paginatedProducts}
                onAction={handleProductAction}
                activeFilter={activeFilter}
                startIndex={startItemNumber}
              />
            )}
          </CardContent>
        </Card>

        <PaginationControls
          currentPage={currentPage}
          totalItems={filteredProducts.length}
          itemsPerPage={itemsPerPage}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </div>
    </div>
  );
};

export default CategoryPage;
