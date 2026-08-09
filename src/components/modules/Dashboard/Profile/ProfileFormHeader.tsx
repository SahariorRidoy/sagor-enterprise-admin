'use client';
import Image from "next/image";
import React from "react";

interface ProfileFormHeaderProps {
  isViewMode: boolean;
}

const ProfileFormHeader = ({ isViewMode }: ProfileFormHeaderProps) => {
  if (isViewMode) return null;
  
  return (
    <div className="flex justify-center mt-4">
      <div className="relative h-28 w-28 rounded-full border overflow-hidden">
        <Image
          src="/default-profile.png"
          alt="Profile"
          layout="fill"
          objectFit="cover"
        />
      </div>
    </div>
  );
};

export default ProfileFormHeader;
