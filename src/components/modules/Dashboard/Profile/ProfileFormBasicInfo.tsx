"use client";
import InputField from "@/components/shared/InputField";
import { Select } from "@/components/shared/Select";
import { Textarea } from "@/components/shared/Textarea";
import { useState } from "react";
import { useAppSelector } from "@/redux/hooks";
import { selectCurrentUser } from "@/redux/featured/auth/authSlice";

interface ProfileFormBasicInfoProps {
  isViewMode: boolean;
  formData?: {
    name: string;
    gender: string;
    contactNo: string;
    bio: string;
  };
  setFormData?: (data: any) => void;
}

const ProfileFormBasicInfo = ({ isViewMode, formData, setFormData }: ProfileFormBasicInfoProps) => {
  const user = useAppSelector(selectCurrentUser);
  
  const handleInputChange = (field: string, value: string) => {
    if (setFormData && formData) {
      setFormData({ ...formData, [field]: value });
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 mt-4">
        <InputField
          label="Email"
          value={user?.email || ""}
          readOnly={true}
          disabled={true}
        />
        <InputField
          label="Name"
          value={formData?.name || user?.name || "Admin"}
          readOnly={isViewMode}
          onChange={(e) => handleInputChange('name', e.target.value)}
        />
        <Select
          label="Gender"
          options={["Male", "Female", "Other"]}
          disabled={isViewMode}
          value={(formData?.gender ? formData.gender.charAt(0).toUpperCase() + formData.gender.slice(1) : null) || (user?.gender ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1) : null) || "Male"}
          onChange={(value) => handleInputChange('gender', value.toLowerCase())}
        />
        <InputField
          label="Phone Number"
          value={formData?.contactNo || user?.contactNo || ""}
          readOnly={isViewMode}
          onChange={(e) => handleInputChange('contactNo', e.target.value)}
          placeholder="01712345678"
        />
      </div>
      
      <div className="mt-4">
        <Textarea
          label="Biography"
          placeholder="Enter a biography about you"
          rows={4}
          disabled={isViewMode}
          value={formData?.bio || user?.bio || ""}
          onChange={(e) => handleInputChange('bio', e.target.value)}
        />
      </div>
    </>
  );
};

export default ProfileFormBasicInfo;