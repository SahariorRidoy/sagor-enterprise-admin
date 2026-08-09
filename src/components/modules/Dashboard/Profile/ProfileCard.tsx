'use client';
import { CirclePlus, Copy, Link, Share2 } from "lucide-react";
import Image from "next/image";
import AddSocial from "./AddSocial";
import { Button } from "../../../ui/button";
import { ReusableDialog } from "../../../shared/ReusableDialog";
import { useAppSelector } from "@/redux/hooks";
import { selectCurrentUser } from "@/redux/featured/auth/authSlice";

export default function ProfileCard() {
  const user = useAppSelector(selectCurrentUser);

  return (
    <div className="bg-white rounded-xl shadow p-6 text-center">
      <div className="flex justify-between">
        <h2 className="font-bold opacity-80 text-lg">Profile </h2>
        <Share2 className="opacity-60 " />
      </div>
      <div className="relative h-24 w-24 mx-auto rounded-full border overflow-hidden">
        <Image
          src="/default-profile.png"
          alt="Profile"
          layout="fill"
          objectFit="cover"
        />
      </div>

      <h2 className="text-lg font-semibold mt-4 opacity-90">{user?.name || 'Admin'}</h2>
      <p className=" text-sm flex gap-3 justify-center opacity-60">
        {user?.email || 'admin@gmail.com'}
      </p>
      <div className="flex justify-center mt-4">
      </div>
    </div>
  );
}
