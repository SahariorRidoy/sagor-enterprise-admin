/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Trash2 } from "lucide-react";
import { setTags } from "@/redux/featured/tags/tagsSlice";
import { useAppDispatch } from "@/redux/hooks";
import { ITag, ITagQueryParams } from "@/types/tags";
import CreateAndUpdateTag from "@/components/tag/CreateAndUpdate";
import ViewTagDetails from "@/components/tag/ViewTag";
import {
  useGetAllTagsQuery,
  useGetTagStatusQuery,
  useDeleteTagMutation,
} from "@/redux/featured/tags/tagsApi";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PaginationView from "@/components/Pagination";
import Swal from "sweetalert2";

interface TagData {
  data: ITag[];
  meta: any;
}

const TagManagement = () => {
  const dispatch = useAppDispatch();
  const [currentPage, setCurrentPage] = useState(1);
  const [queryParams, setQueryParams] = useState<ITagQueryParams>({ limit: 8 });
  const [deleteTag] = useDeleteTagMutation();

  const {
    data: TagStatus,
    isLoading: TagStatusLoading,
    refetch: tagStatusRefetch,
  } = useGetTagStatusQuery(undefined);

  const { data: allTags, isLoading, refetch } = useGetAllTagsQuery(queryParams);

  useEffect(() => {
    if (allTags) {
      dispatch(setTags(allTags as TagData));
      tagStatusRefetch();
    }
  }, [dispatch, allTags, tagStatusRefetch]);

  useEffect(() => {
    setQueryParams((prev) => ({
      ...prev,
      page: currentPage,
    }));
  }, [currentPage]);

  const colors: Record<string, string> = {
    Marketing: "bg-green-100 text-green-800",
    Status: "bg-blue-100 text-blue-800",
    Promotion: "bg-pink-100 text-pink-800",
    Quality: "bg-purple-100 text-purple-800",
    Feature: "bg-teal-100 text-teal-800",
    Exclusivity: "bg-orange-100 text-orange-800",
  };

  const tagTypes = TagStatus?.data?.tagTypesAgg.map((tag: any) => ({
    ...tag,
    color: colors[tag.name] || "bg-gray-100 text-gray-800",
  }));

  const types = [
    "Marketing",
    "Status",
    "Promotion",
    "Quality",
    "Feature",
    "Exclusivity",
  ];

  // ✅ Delete handler with SweetAlert confirmation
  const handleDeleteTag = async (id: string) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This tag will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (confirm.isConfirmed) {
      try {
        await deleteTag(id).unwrap();
        await refetch();
        Swal.fire({
          title: "Deleted!",
          text: "Tag deleted successfully.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (error) {
        Swal.fire({
          title: "Error!",
          text: "Failed to delete tag.",
          icon: "error",
        });
      }
    }
  };

  if (!allTags && !TagStatus) {
    return <div>Loading....</div>;
  }

  return (
    <div className="space-y-6 py-6">
      {/* Add Tag Button */}
      <div className="flex justify-end">
        <CreateAndUpdateTag
          refetch={refetch}
          tagStatusRefetch={tagStatusRefetch}
        >
          + Add Tag
        </CreateAndUpdateTag>
      </div>

      {/* Tag Management Section */}
      <div className="bg-white rounded-lg p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Tag Management</h2>
          <p className="text-gray-600 text-sm">
            Organize and label your products with tags
          </p>
        </div>

        {/* Search and Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search tags"
              value={queryParams.searchTerm}
              onChange={(e) =>
                setQueryParams((prev) => ({
                  ...prev,
                  searchTerm: e.target.value,
                }))
              }
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Select
              value={queryParams.type || ""}
              onValueChange={(value) =>
                setQueryParams((prev) => ({
                  ...prev,
                  type: value === "all" ? undefined : value,
                }))
              }
            >
              <SelectTrigger className="w-40 text-black">
                <SelectValue placeholder="Filter by Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {types.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tags Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {isLoading ? (
            <div>Loading.......</div>
          ) : (
            allTags?.data?.map((tag: ITag, index: number) => (
              <Card key={index} className="p-4">
                <CardContent className="p-0">
                  <div className="flex items-start justify-between mb-3">
                    <Badge className={"bg-amber-100 text-black"}>
                      {tag.name}
                    </Badge>
                    {/* 🗑️ Delete icon */}
                    <Trash2
                      className="w-4 h-4 text-red-500 cursor-pointer hover:text-red-700"
                      onClick={() => handleDeleteTag(tag._id)}
                    />
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="text-sm">
                      <span className="text-gray-600">Type:</span>
                      <span className="ml-2 font-medium">{tag?.type}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-600">Usage:</span>
                      <span className="ml-2 font-medium">{tag.details}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <CreateAndUpdateTag
                      type="edit"
                      updateTag={tag}
                      refetch={refetch}
                    >
                      Edit
                    </CreateAndUpdateTag>
                    <ViewTagDetails tag={tag} />
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      <PaginationView
        setCurrentPage={setCurrentPage}
        currentPage={currentPage}
        meta={allTags?.meta}
      />
    </div>
  );
};

export default TagManagement;
