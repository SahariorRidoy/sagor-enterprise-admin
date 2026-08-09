/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ICategory } from '@/types/Category';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { selectCategories, setCategories } from '@/redux/featured/categories/categorySlice';
import { useGetAllCategoriesQuery, useDeleteCategoryMutation } from '@/redux/featured/categories/categoryApi';
import Category from '@/components/category/Category';
import ViewCategoryDetails from '@/components/category/ViewCategory';
import { Trash2, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import withReactContent from 'sweetalert2-react-content';
import Swal from 'sweetalert2';
export default function CategoryManagement() {
  const { data: allCategories, isLoading, refetch } = useGetAllCategoriesQuery();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const dispatch = useAppDispatch();
  const MySwal = withReactContent(Swal);
  const categories = useAppSelector(selectCategories);
  const [deleteCategory, { isLoading: deleting }] = useDeleteCategoryMutation();

  useEffect(() => {
    if (allCategories) {
      dispatch(setCategories(allCategories as ICategory[]));
    }
  }, [allCategories, dispatch]);

  // Filter categories by search term
  const filteredCategories = categories.filter(cat => {
    const term = searchTerm.toLowerCase();
    return (
      cat.name.toLowerCase().includes(term) ||
      cat.details.toLowerCase().includes(term)
    );
  });

  // Pagination variables
  const ITEMS_PER_PAGE = 4;
  const totalPages = Math.ceil(filteredCategories.length / ITEMS_PER_PAGE);
  const startIdx = currentPage * ITEMS_PER_PAGE;
  const currentItems = filteredCategories.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  // Pagination handlers
  const nextPage = () => {
    if (currentPage < totalPages - 1) setCurrentPage(prev => prev + 1);
  };
  const prevPage = () => {
    if (currentPage > 0) setCurrentPage(prev => prev - 1);
  };

  // Delete handler
  const handleDeleteCategory = async (id: string, name: string) => {
    const result = await MySwal.fire({
      title: `Delete ${name}?`,
      text: "This action cannot be undone!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626', // red
      cancelButtonColor: '#6b7280', // gray
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    });
  
    if (result.isConfirmed) {
      try {
        await deleteCategory(id).unwrap(); // RTK delete mutation
        MySwal.fire('Deleted!', `${name} has been deleted.`, 'success');
        refetch(); // or update Redux state directly
      } catch (err: any) {
        MySwal.fire('Error!', err?.data?.message || 'Failed to delete category', 'error');
      }
    }
  };

  return (
    <div className="space-y-6 py-6">
      {/* Add Category Button */}
      <div className="flex justify-end">
        <Category refetch={refetch}>+ Add Category</Category>
      </div>

      {/* Search Input */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search here..."
            value={searchTerm}
            onChange={e => {
              setSearchTerm(e.target.value);
              setCurrentPage(0);
            }}
            className="pl-10"
          />
        </div>
      </div>

      {/* Pagination Arrows and Cards */}
      <div className="relative w-full">
        {totalPages > 1 && (
          <button
            onClick={prevPage}
            disabled={currentPage === 0}
            className={`absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white p-2 shadow-md hover:bg-gray-100 transition ${
              currentPage === 0 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <ChevronLeft className="h-5 w-5 text-gray-700" />
          </button>
        )}

        <div className="grid gap-4 px-4 py-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
          {currentItems.map(({ name, icon }) => (
            <Card key={name} className="w-full cursor-pointer transition-all hover:shadow-md bg-gray-100">
              <CardContent className="flex items-center gap-3 py-4 px-3">
                <div className="text-2xl shrink-0">{/* icon placeholder */}</div>
                <span className="text-sm font-medium text-gray-700 truncate w-full">{name}</span>
              </CardContent>
            </Card>
          ))}
        </div>

        {totalPages > 1 && (
          <button
            onClick={nextPage}
            disabled={currentPage === totalPages - 1}
            className={`absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white p-2 shadow-md hover:bg-gray-100 transition ${
              currentPage === totalPages - 1 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <ChevronRight className="h-5 w-5 text-gray-700" />
          </button>
        )}
      </div>

      {/* Category Management Table */}
      <div className="bg-white rounded-lg p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Category Management</h2>
          <p className="text-gray-600 text-sm">Manage your product brands and suppliers</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-600">Category</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Subcategories</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Description</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={4} className="text-center py-10">Loading...</td></tr>
              ) : filteredCategories.length > 0 ? (
                filteredCategories.map((category, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{category.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">{category?.subCategories.length}</td>
                    <td className="py-4 px-4 text-gray-600 max-w-xs truncate">{category.details}</td>
                    <td className="py-4 px-4">
                      <div className="flex gap-2">
                        <Category type="edit" editCategory={category} refetch={refetch}>Edit</Category>
                        <ViewCategoryDetails category={category} />
                        {/* Delete Icon */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteCategory(category._id , category.name)}
                          disabled={deleting}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="text-center py-10 text-gray-500">No categories found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
