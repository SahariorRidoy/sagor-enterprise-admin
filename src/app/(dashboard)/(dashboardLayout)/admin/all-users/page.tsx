"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreVertical,
  UserIcon,
  UsersIcon,
  CalendarDaysIcon,
} from "lucide-react";
import { UserStatCard } from "@/components/shared/userStatCard";
import { UserFilterBar } from "@/components/shared/UserFilterBar";
// import { format } from "date-fns/esm";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  useDeleteUserMutation,
  useGetAllUsersQuery,
  useUpdateUserMutation,
} from "@/redux/featured/user/userApi";

const USERS_PER_PAGE = 10;
import Swal from "sweetalert2"; // ✅ for confirmation popup
const AllUsersPage = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  // ✅ Fetch all users once (limit 1000)
  const {
    data: users = [],
    isLoading,
    refetch,
  } = useGetAllUsersQuery({
    page: 1,
    limit: 1000,
  });

  const [updateUserStatus, { isLoading: updating }] = useUpdateUserMutation();
  const [deleteUser, { isLoading: deleting }] = useDeleteUserMutation();

  if (isLoading) return <p>Loading...</p>;

  // ✅ Local filter (search + status)
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      (user.name?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
      (user.email?.toLowerCase().includes(search.toLowerCase()) ?? false);
    const matchesStatus =
      statusFilter === "all" || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // ✅ Local pagination
  const totalUsers = filteredUsers.length;
  const totalPages = Math.ceil(totalUsers / USERS_PER_PAGE);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * USERS_PER_PAGE,
    currentPage * USERS_PER_PAGE
  );

  const activeUsers = users.filter((u) => u.status === "active").length;
  const newThisMonth = users.length;

  const handleToggleStatus = async (
    id: string,
    email: string,
    currentStatus: string
  ) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    try {
      await updateUserStatus({
        id,
        data: { email, status: newStatus },
      }).unwrap();
      toast.success(`User ${email} is now ${newStatus}!`);
      refetch();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.data?.message || "Failed to update user status");
    }
  };
  const handleDeleteUser = async (id: string, email: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Delete user ${email}? This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await deleteUser(id).unwrap();
        toast.success(`User ${email} deleted successfully!`);
        refetch();
      } catch (err: any) {
        console.error(err);
        toast.error(err?.data?.message || "Failed to delete user");
      }
    }
  };

  return (
    <div className="p-4 py-6 space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <UserStatCard
          title="All Users"
          value={String(users.length)}
          subtitle="+2 from last week"
          icon={<UserIcon className="h-6 w-6 text-pink-600" />}
        />
        <UserStatCard
          title="Active Users"
          value={String(activeUsers)}
          subtitle={`${Math.round(
            (activeUsers / users.length) * 100 || 0
          )}% active rate`}
          icon={<UsersIcon className="h-6 w-6 text-green-600" />}
        />
        <UserStatCard
          title="New This Month"
          value={String(newThisMonth)}
          subtitle="+50% from last month"
          icon={<CalendarDaysIcon className="h-6 w-6 text-pink-600" />}
        />
      </div>

      {/* Filter Bar */}
      <UserFilterBar
        search={search}
        setSearch={setSearch}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />

      {/* User Table */}
      <div className="overflow-x-auto border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow className="border border-[#CFCFCF]">
              <TableHead className="text-center">User</TableHead>
              <TableHead className="text-center">Email</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-center">Join Date</TableHead>
              <TableHead className="text-center">Orders</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedUsers.map((user, index) => (
              <TableRow key={index} className="border-none">
                <TableCell className="py-4">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-sm text-muted-foreground font-medium">
                      {user.name?.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {user.role === "sr" ? "Marketing Officer" : user.role}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-4 text-center">{user.email}</TableCell>
                <TableCell className="py-4 text-center">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      user.status === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-300 text-gray-700"
                    }`}
                  >
                    {user.status}
                  </span>
                </TableCell>
                <TableCell className="py-4 text-center">
                  {user.createdAt
                    ? format(new Date(user.createdAt), "MMM dd, yyyy")
                    : "—"}
                </TableCell>
                <TableCell className="py-4 text-center">
                  {user.totalPaidOrders ?? 0}
                </TableCell>
                <TableCell className="py-4 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() =>
                          user._id && user.email && user.status
                            ? handleToggleStatus(
                                user._id,
                                user.email,
                                user.status
                              )
                            : undefined
                        }
                        disabled={updating}
                        className={`${
                          user.status === "active"
                            ? "text-gray-700"
                            : "text-green-600"
                        }`}
                      >
                        {user.status === "active"
                          ? "Set Inactive"
                          : "Activate User"}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() =>
                          user._id && user.email
                            ? handleDeleteUser(user._id, user.email)
                            : undefined
                        }
                        disabled={deleting}
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center space-x-2 mt-4">
          <Button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
          >
            Prev
          </Button>
          {Array.from({ length: totalPages }, (_, i) => (
            <Button
              key={i}
              variant={currentPage === i + 1 ? "default" : "outline"}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </Button>
          ))}
          <Button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default AllUsersPage;
