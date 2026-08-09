"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Upload, Loader2, Save } from "lucide-react";
import toast from "react-hot-toast";
import {
  useGetSettingsQuery,
  useUpdateSettingsMutation,
} from "@/redux/featured/settings/settingsApi";

export default function SettingsTab() {
  const { data, isLoading } = useGetSettingsQuery();
  const [updateSettings, { isLoading: updating }] = useUpdateSettingsMutation();

  const [activeTab, setActiveTab] = useState<"mobileMfs" | "deliveryCharge">("mobileMfs");

  const [mobileMfs, setMobileMfs] = useState({
    bKash: { bKashLogo: "", bKashNumber: "" },
    nagad: { nagadLogo: "", nagadNumber: "" },
    rocket: { rocketLogo: "", rocketNumber: "" },
    upay: { upayLogo: "", upayNumber: "" },
  });
  const [deliveryCharge, setDeliveryCharge] = useState<number>(0);
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState<number>(0);
  const [files, setFiles] = useState<Record<string, File | null>>({});

  // Load settings data
  useEffect(() => {
    if (data) {
      if (data.mobileMfs) setMobileMfs(data.mobileMfs);
      if (data.deliveryCharge !== undefined) setDeliveryCharge(data.deliveryCharge);
      if (data.freeDeliveryThreshold !== undefined) setFreeDeliveryThreshold(data.freeDeliveryThreshold);
    }
  }, [data]);

  type MfsType = keyof typeof mobileMfs;

  const handleChange = (type: MfsType, field: string, value: string) => {
    setMobileMfs((prev) => ({
      ...prev,
      [type]: { ...prev[type], [field]: value },
    }));
  };

  const handleFileChange = (type: MfsType, file: File | null) => {
    if (!file) return;
    setFiles((prev) => ({ ...prev, [type]: file }));
    setMobileMfs((prev) => ({
      ...prev,
      [type]: { ...prev[type], [`${type}Logo`]: URL.createObjectURL(file) },
    }));
  };

  const handleSubmit = async (e: React.FormEvent, type: "mobileMfs" | "deliveryCharge") => {
    e.preventDefault();
    try {
      const formData = new FormData();

      if (type === "mobileMfs") {
        // ✅ Add all phone numbers to mobileMfs nested structure
        Object.entries(mobileMfs).forEach(([key, value]) => {
          const numKey = `${key}Number`;
          const item = value as Record<string, string>;
          
          // Append phone number in nested format
          formData.append(`mobileMfs[${key}][${numKey}]`, item[numKey] || "");
          
          // Append existing logo URL if no new file is uploaded
          const logoKey = `${key}Logo`;
          if (!files[key as keyof typeof files] && item[logoKey]) {
            formData.append(`mobileMfs[${key}][${logoKey}]`, item[logoKey]);
          }
        });

        // ✅ Add logo files separately (backend expects them as top-level fields)
        Object.entries(files).forEach(([key, file]) => {
          if (file) {
            formData.append(`${key}Logo`, file);
          }
        });
      } else if (type === "deliveryCharge") {
        formData.append("deliveryCharge", deliveryCharge.toString());
        formData.append("freeDeliveryThreshold", freeDeliveryThreshold.toString());
      }

      // 🔍 Debug (optional)
      for (const pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }

      const res = await updateSettings(formData).unwrap();

      if (res.success) {
        toast.success(
          type === "mobileMfs"
            ? "Mobile MFS updated successfully!"
            : "Delivery settings updated successfully!"
        );
        // Clear files state after successful upload
        setFiles({});
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update!");
    }
  };

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );

  return (
    <div className="p-6 bg-white rounded-md shadow-sm">
      <h2 className="text-2xl font-semibold mb-4"> Payment Method and Delivery Charge Settings</h2>

      {/* Tabs */}
      <div className="mb-6 flex gap-4 border-b border-gray-200">
        <button
          className={`py-2 px-4 font-medium ${
            activeTab === "mobileMfs" ? "border-b-2 border-indigo-600" : ""
          }`}
          onClick={() => setActiveTab("mobileMfs")}
        >
          Mobile MFS
        </button>
        <button
          className={`py-2 px-4 font-medium ${
            activeTab === "deliveryCharge" ? "border-b-2 border-indigo-600" : ""
          }`}
          onClick={() => setActiveTab("deliveryCharge")}
        >
          Delivery Charge
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "mobileMfs" && (
        <form onSubmit={(e) => handleSubmit(e, "mobileMfs")} className="grid md:grid-cols-2 gap-6">
          {Object.entries(mobileMfs).map(([key, value]: any) => (
            <div key={key} className="border rounded-md p-4 flex flex-col gap-3 bg-gray-50">
              <h3 className="capitalize font-medium">{key}</h3>

              <Input
                placeholder={`${key} number`}
                value={value[`${key}Number`] || ""}
                onChange={(e) => handleChange(key, `${key}Number`, e.target.value)}
              />

              <div className="flex items-center gap-3">
                {value[`${key}Logo`] ? (
                  <div className="relative w-16 h-16 border rounded overflow-hidden">
                    <Image
                      src={value[`${key}Logo`]}
                      alt={`${key} logo`}
                      fill
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 flex items-center justify-center bg-gray-200 rounded text-xs text-gray-500">
                    No Logo
                  </div>
                )}

                <label className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded cursor-pointer hover:bg-gray-200">
                  <Upload size={14} /> Upload
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileChange(key, e.target.files?.[0] || null)}
                  />
                </label>
              </div>
            </div>
          ))}

          <div className="md:col-span-2 flex justify-end mt-2">
            <Button type="submit" disabled={updating}>
              {updating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Changes
            </Button>
          </div>
        </form>
      )}

      {activeTab === "deliveryCharge" && (
        <form onSubmit={(e) => handleSubmit(e, "deliveryCharge")} className="flex flex-col gap-4 max-w-md">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Delivery Charge (৳)</label>
            <Input
              type="number"
              placeholder="Enter delivery charge"
              value={deliveryCharge}
              onChange={(e) => setDeliveryCharge(Number(e.target.value))}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Free Delivery Threshold (৳)</label>
            <Input
              type="number"
              placeholder="Enter minimum order amount for free delivery"
              value={freeDeliveryThreshold}
              onChange={(e) => setFreeDeliveryThreshold(Number(e.target.value))}
            />
            <p className="text-xs text-gray-500">
              Orders above this amount will get free delivery. Set to 0 to disable free delivery.
            </p>
          </div>

          <div className="bg-blue-50 p-3 rounded-md">
            <h4 className="text-sm font-medium text-blue-800 mb-1">Preview:</h4>
            <p className="text-xs text-blue-600">
              • Orders below ৳{freeDeliveryThreshold} → Delivery charge: ৳{deliveryCharge}
            </p>
            <p className="text-xs text-blue-600">
              • Orders ৳{freeDeliveryThreshold} and above → Free delivery
            </p>
          </div>

          <Button type="submit" disabled={updating}>
            {updating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Delivery Settings
          </Button>
        </form>
      )}
    </div>
  );
}