"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Eye, EyeOff, KeyRound, Loader2, PlugZap, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useDeleteCourierCredentialsMutation,
  useGetCourierCredentialsQuery,
  useSaveCourierCredentialsMutation,
  useTestCourierCredentialsMutation,
} from "@/redux/featured/courier/steadfastApi";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const errMsg = (err: any, fallback: string) => err?.data?.message || err?.message || fallback;

const sourceLabel: Record<string, { text: string; cls: string }> = {
  database: { text: "Saved from admin panel", cls: "bg-green-100 text-green-700" },
  env: { text: "Using server .env (fallback)", cls: "bg-yellow-100 text-yellow-700" },
  none: { text: "Not configured", cls: "bg-red-100 text-red-700" },
};

export default function CourierSettingsPage() {
  const { data: status, isLoading, isError, error, refetch } = useGetCourierCredentialsQuery();
  const [saveCreds, { isLoading: saving }] = useSaveCourierCredentialsMutation();
  const [deleteCreds, { isLoading: deleting }] = useDeleteCourierCredentialsMutation();
  const [testCreds, { isLoading: testing }] = useTestCourierCredentialsMutation();

  const [apiKey, setApiKey] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [show, setShow] = useState(false);
  const [skipVerify, setSkipVerify] = useState(false);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim() || !secretKey.trim()) {
      toast.error("Both API key and secret key are required");
      return;
    }
    try {
      await saveCreds({ apiKey: apiKey.trim(), secretKey: secretKey.trim(), skipVerify }).unwrap();
      toast.success(skipVerify ? "Credentials saved" : "Credentials verified with Steadfast and saved");
      setApiKey("");
      setSecretKey("");
      refetch();
    } catch (err) {
      toast.error(errMsg(err, "Failed to save credentials"));
    }
  };

  const onTest = async () => {
    try {
      const res = await testCreds().unwrap();
      toast.success(
        `Connection OK${res.balance !== null && res.balance !== undefined ? ` — balance: ৳${res.balance}` : ""}`
      );
    } catch (err) {
      toast.error(errMsg(err, "Connection test failed"));
    }
  };

  const onDelete = async () => {
    if (!confirm("Remove the saved Steadfast credentials? The server will fall back to its .env keys, if any.")) return;
    try {
      await deleteCreds().unwrap();
      toast.success("Saved credentials removed");
      refetch();
    } catch (err) {
      toast.error(errMsg(err, "Failed to remove credentials"));
    }
  };

  const badge = sourceLabel[status?.source ?? "none"];

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-1">Courier Settings</h1>
      <p className="text-sm text-gray-500 mb-6">
        Steadfast API credentials. Keys are stored encrypted on the server and are never shown in full.
      </p>

      {/* Current status */}
      <div className="bg-white border rounded-lg p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Current credentials</h2>
          {status && <span className={`text-xs px-2 py-1 rounded ${badge.cls}`}>{badge.text}</span>}
        </div>

        {isLoading ? (
          <p className="text-sm text-gray-500 flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
          </p>
        ) : isError ? (
          <p className="text-sm text-red-600">{errMsg(error, "Could not load credentials status")}</p>
        ) : (
          <>
            <dl className="grid grid-cols-[120px_1fr] gap-y-2 text-sm">
              <dt className="text-gray-500">API key</dt>
              <dd className="font-mono">{status?.apiKey || "—"}</dd>
              <dt className="text-gray-500">Secret key</dt>
              <dd className="font-mono">{status?.secretKey || "—"}</dd>
              {status?.updatedAt && (
                <>
                  <dt className="text-gray-500">Last updated</dt>
                  <dd>
                    {new Date(status.updatedAt).toLocaleString()}
                    {status.updatedBy ? ` by ${status.updatedBy}` : ""}
                  </dd>
                </>
              )}
            </dl>
            <div className="flex gap-2 mt-4">
              <Button type="button" variant="outline" onClick={onTest} disabled={testing || !status?.configured}>
                {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlugZap className="h-4 w-4" />}
                Test connection
              </Button>
              {status?.source === "database" && (
                <Button type="button" variant="outline" onClick={onDelete} disabled={deleting} className="text-red-600">
                  {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  Remove saved keys
                </Button>
              )}
            </div>
          </>
        )}
      </div>

      {/* Update form */}
      <form onSubmit={onSave} className="bg-white border rounded-lg p-5 flex flex-col gap-4">
        <h2 className="font-semibold flex items-center gap-2">
          <KeyRound className="h-4 w-4" /> {status?.configured ? "Replace credentials" : "Add credentials"}
        </h2>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-gray-700">API Key</span>
          <input
            type={show ? "text" : "password"}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            autoComplete="off"
            className="border border-gray-300 rounded-md p-2 font-mono focus:outline-none focus:ring-1 focus:ring-black"
            placeholder="Steadfast Api-Key"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-gray-700">Secret Key</span>
          <div className="relative">
            <input
              type={show ? "text" : "password"}
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              autoComplete="off"
              className="w-full border border-gray-300 rounded-md p-2 pr-10 font-mono focus:outline-none focus:ring-1 focus:ring-black"
              placeholder="Steadfast Secret-Key"
            />
            <button
              type="button"
              onClick={() => setShow(!show)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
              aria-label={show ? "Hide keys" : "Show keys"}
            >
              {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </label>

        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input type="checkbox" checked={skipVerify} onChange={(e) => setSkipVerify(e.target.checked)} />
          Save without verifying with Steadfast
        </label>

        <Button type="submit" disabled={saving} className="w-full">
          {saving ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> {skipVerify ? "Saving…" : "Verifying & saving…"}
            </span>
          ) : (
            "Save credentials"
          )}
        </Button>
      </form>
    </div>
  );
}
