import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Product } from "@/types/Product";
import Link from "next/link";
import UpdateStock from "../inventory/UpdateStock";

interface Props {
  products: Product[];
  isLoading: boolean;
  refetch: any;
  InventoryStatusRefetch: any;
}

const getStatusColor = (quantity: number) => {
  if (quantity === 0) return "bg-red-100 text-red-800";
  if (quantity <= 5) return "bg-yellow-100 text-yellow-800"; // Low stock
  return "bg-blue-100 text-blue-800"; // In stock
};

const getStatusText = (quantity: number) => {
  if (quantity === 0) return "Out of Stock";
  if (quantity <= 5) return "Low Stock";
  return "In Stock";
};

const ProductTable = ({
  products,
  isLoading,
  refetch,
  InventoryStatusRefetch,
}: Props) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 font-medium text-gray-600">
              Product
            </th>
            <th className="text-left py-3 px-4 font-medium text-gray-600">
              SKU
            </th>
            <th className="text-left py-3 px-4 font-medium text-gray-600">
              Category
            </th>
            <th className="text-left py-3 px-4 font-medium text-gray-600">
              Stock
            </th>
            <th className="text-left py-3 px-4 font-medium text-gray-600">
              Status
            </th>
            <th className="text-left py-3 px-4 font-medium text-gray-600">
              Price
            </th>
            <th className="text-left py-3 px-4 font-medium text-gray-600">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={7}>Loading...</td>
            </tr>
          ) : (
            products.map((product, index) => (
              <tr
                key={index}
                className="border-b border-gray-100 hover:bg-gray-50"
              >
                <td className="py-4 px-4 font-medium">
                  {product.description.name}
                </td>
                <td className="py-4 px-4 text-gray-600">
                  {product.productInfo.sku}
                </td>
                <td className="py-4 px-4 text-gray-600">
                  {product.brandAndCategories?.categories?.[0]?.name}
                </td>
                <td className="py-4 px-4">{product.productInfo.quantity}</td>
                <td className="py-4 px-4">
                  <Badge
                    className={getStatusColor(product.productInfo.quantity)}
                  >
                    {getStatusText(product.productInfo.quantity)}
                  </Badge>
                </td>
                <td className="py-4 px-4 font-medium">
                  {product.productInfo.price}
                </td>
                <td className="py-4 px-4">
                  <div className="flex gap-2">
                    <Link href={`/admin/edit-product/${product._id}`}>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </Link>
                    <UpdateStock
                      Productdata={product}
                      refetch={refetch}
                      InventoryStatusRefetch={InventoryStatusRefetch}
                    >
                      Restock
                    </UpdateStock>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ProductTable;
