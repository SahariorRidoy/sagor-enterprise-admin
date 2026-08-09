'use client';
import ProfileForm from "@/components/forms/ProfileForm";

const UpdateProfileCard = () => {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="font-bold opacity-80 text-lg mb-6">Update Profile</h2>
      <ProfileForm mode="edit" />
    </div>
  );
};

export default UpdateProfileCard;
