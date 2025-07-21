"use client";
import React, { useEffect } from "react";
import { useAuth } from "../AuthWrapper";
import { useRouter } from "next/navigation";

const ProfilePage = () => {
  const { user, loading, userLogout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading) return <div className="text-center mt-10">Loading...</div>;
  if (!user) return null;

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded shadow bg-white">
      <h2 className="text-2xl font-bold mb-4">Profile</h2>
      <div className="mb-4">
        <span className="font-semibold">Email:</span> {user.email}
      </div>
      <button
        onClick={userLogout}
        className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded"
      >
        Logout
      </button>
    </div>
  );
};

export default ProfilePage; 