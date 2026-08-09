import { baseApi } from "@/redux/api/baseApi";
import { User } from "@/types/User";

// types
type GetAllUsersParams = {
  page?: number;
  limit?: number;
};

const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ✅ Get all users
    getAllUsers: builder.query<User[], GetAllUsersParams>({
      query: (params) => ({
        url: "/user",
        method: "GET",
        params, // query string automatically generated
      }),
      transformResponse: (response: { data: User[] }) => response.data,
    }),

    // ✅ Get single user
    getSingleUser: builder.query<User, string>({
      query: (id) => ({
        url: `/user/${id}`,
        method: "GET",
      }),
      transformResponse: (response: { data: User }) => response.data,
    }),

    // ✅ Update user
    updateUser: builder.mutation<User, { id: string; data: Partial<User> }>({
      query: ({ id, data }) => ({
        url: `/user/${id}`,
        method: "PATCH",
        body: data,
      }),
      transformResponse: (response: { data: User }) => response.data,
    }),

    // ✅ Delete user
    deleteUser: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/user/${id}`,
        method: "DELETE",
      }),
      transformResponse: (response: { message: string }) => response,
    }),
  }),
});

export const {
  useGetAllUsersQuery,
  useGetSingleUserQuery,
  useUpdateUserMutation,
  useDeleteUserMutation, // ✅ Export the new hook
} = userApi;
