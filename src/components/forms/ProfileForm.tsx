'use client';
import { Button } from "../ui/button";
import ProfileFormHeader from "../modules/Dashboard/Profile/ProfileFormHeader";
import ProfileFormBasicInfo from "../modules/Dashboard/Profile/ProfileFormBasicInfo";
import { useUpdateProfileMutation } from "@/redux/featured/adminprofile/adminprofileApi";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { selectCurrentUser, setUser } from "@/redux/featured/auth/authSlice";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

interface ProfileFormProps {
  mode?: "view" | "edit";
  onClose?: () => void;
}

export default function ProfileForm({ mode = "view", onClose }: ProfileFormProps) {
  const isViewMode = mode === "view";
  const user = useAppSelector(selectCurrentUser);
  const dispatch = useAppDispatch();
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();
  const [formData, setFormData] = useState({
    name: '',
    gender: 'male',
    contactNo: '',
    bio: ''
  });
  const [isInitialized, setIsInitialized] = useState(false);

  // Update formData when user data is available
  useEffect(() => {
    if (user && !isInitialized) {
      setFormData({
        name: user.name || '',
        gender: user.gender || 'male',
        contactNo: user.contactNo || '',
        bio: user.bio || ''
      });
      setIsInitialized(true);
    }
  }, [user, isInitialized]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userId = user?._id;
      if (!userId) {
        console.error('User object:', user);
        toast.error('User ID not found. Please login again.');
        return;
      }
      
      const updateData = {
        userId,
        email: user?.email,
        ...formData
      };
      
      const response = await updateProfile(updateData).unwrap();
      
      if (response.success) {
        // Update Redux with merged data to preserve all fields
        dispatch(setUser({
          user: { ...user, ...formData },
          accessToken: localStorage.getItem('accessToken')
        }));
        
        toast.success('Profile updated successfully!');
        onClose?.();
      }
    } catch (error: any) {
      console.error('Update error:', error);
      toast.error(error?.data?.message || 'Failed to update profile');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <ProfileFormHeader isViewMode={isViewMode} />
      <ProfileFormBasicInfo 
        isViewMode={isViewMode} 
        formData={formData}
        setFormData={setFormData}
      />
      
      {!isViewMode && (
        <div className="flex justify-center mt-6">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      )}
    </form>
  );
}
