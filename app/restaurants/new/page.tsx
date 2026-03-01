"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Sidebar from "../../_component/sidebar";
import ImageUpload from "../../_component/ImageUpload";
import { createRestaurant } from "@/lib/restaurants";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import type { FoodItem } from "@/types/restaurant";

const DISTRICTS = ["Kathmandu", "Lalitpur", "Bhaktapur"] as const;

export default function NewRestaurantPage() {
  const router = useRouter();
  const { user } = useAuth();
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [district, setDistrict] = useState<"" | (typeof DISTRICTS)[number]>("");
  const [lng, setLng] = useState("");
  const [lat, setLat] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [foods, setFoods] = useState<Array<FoodItem & { image?: string }>>([
    { name: "", price: 0, category: "", image: "" },
  ]);

  const addFood = () => {
    setFoods((prev) => [...prev, { name: "", price: 0, category: "", image: "" }]);
  };

  const updateFood = (index: number, field: keyof (FoodItem & { image?: string }), value: string | number) => {
    setFoods((prev) => {
      const next = [...prev];
      (next[index] as Record<string, unknown>)[field] = value;
      return next;
    });
  };

  const removeFood = (index: number) => {
    if (foods.length <= 1) return;
    setFoods((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please log in");
      router.push("/login");
      return;
    }
    if (user.role !== "admin") {
      toast.error("Only admins can create restaurants");
      return;
    }
    const numLng = parseFloat(lng);
    const numLat = parseFloat(lat);
    if (Number.isNaN(numLng) || Number.isNaN(numLat)) {
      toast.error("Valid longitude and latitude required");
      return;
    }
    setSubmitting(true);
    try {
      const restaurant = await createRestaurant({
        name,
        description: description || undefined,
        address: address || undefined,
        district: district || undefined,
        location: { coordinates: [numLng, numLat] },
        images: images.length ? images : undefined,
        foods: foods
          .filter((f) => f.name.trim())
          .map((f) => ({
            name: f.name,
            price: Number(f.price) || 0,
            category: f.category || undefined,
            image: f.image || undefined,
          })),
      });
      toast.success("Restaurant created");
      router.push(`/restaurants/${restaurant._id}`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Failed to create restaurant";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const mockUser = { name: user?.name ?? "Guest", level: "Admin", role: user?.role };

  if (user && user.role !== "admin") {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Only admins can create restaurants.</p>
          <Link href="/restaurants" className="text-orange-500 font-semibold mt-2 inline-block">
            Back to restaurants
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-50" style={{ fontFamily: "'Segoe UI', 'Helvetica Neue', sans-serif" }}>
      <Sidebar activeTab="restaurants" user={mockUser} />

      <main className="ml-64 min-h-screen">
        <header className="sticky top-0 z-10 border-b border-orange-100 bg-white/80 px-8 py-4 backdrop-blur">
          <Link href="/restaurants" className="text-sm font-semibold text-orange-600 hover:text-orange-700">
            ← Back to Restaurants
          </Link>
          <h1 className="text-xl font-extrabold text-gray-800 mt-1">Create Restaurant</h1>
        </header>

        <form onSubmit={handleSubmit} className="px-8 py-7 max-w-2xl space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-xl border border-orange-200 bg-white px-4 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-orange-200 bg-white px-4 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full rounded-xl border border-orange-200 bg-white px-4 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">District</label>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value as "" | (typeof DISTRICTS)[number])}
              className="w-full rounded-xl border border-orange-200 bg-white px-4 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              <option value="">Select district</option>
              {DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Longitude *</label>
              <input
                type="text"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                placeholder="-122.4194"
                required
                className="w-full rounded-xl border border-orange-200 bg-white px-4 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Latitude *</label>
              <input
                type="text"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                placeholder="37.7749"
                required
                className="w-full rounded-xl border border-orange-200 bg-white px-4 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
          </div>

          <ImageUpload
            folder="restaurants"
            value={images}
            onMultipleChange={setImages}
            multiple
            maxCount={10}
            label="Restaurant images"
            onChange={() => {}}
          />

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-gray-600">Menu (foods)</label>
              <button
                type="button"
                onClick={addFood}
                className="text-sm font-semibold text-orange-500 hover:text-orange-700"
              >
                + Add food
              </button>
            </div>
            <div className="space-y-4">
              {foods.map((food, index) => (
                <div
                  key={index}
                  className="p-4 rounded-xl border text-gray-600 border-orange-200 bg-white space-y-3"
                >
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Food name"
                      value={food.name}
                      onChange={(e) => updateFood(index, "name", e.target.value)}
                      className="rounded-lg border text-gray-600 border-orange-200 px-3 py-2 text-sm"
                    />
                    <input
                      type="number"
                      placeholder="Price"
                      value={food.price || ""}
                      onChange={(e) => updateFood(index, "price", e.target.value)}
                      min={0}
                      step={0.01}
                      className="rounded-lg border border-orange-200 px-3 py-2 text-sm"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Category (optional)"
                    value={food.category || ""}
                    onChange={(e) => updateFood(index, "category", e.target.value)}
                    className="w-full rounded-lg border border-orange-200 px-3 py-2 text-sm"
                  />
                  <ImageUpload
                    folder="foods"
                    value={food.image || ""}
                    onChange={(url) => updateFood(index, "image", url)}
                    label="Food image (optional)"
                  />
                  {foods.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeFood(index)}
                      className="text-sm text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4 text-gray-500">
            <Link
              href="/restaurants"
              className="flex-1 py-2.5 rounded-xl border border-orange-200 text-orange-600 font-semibold text-center hover:bg-orange-100"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold disabled:opacity-50"
            >
              {submitting ? "Creating…" : "Create Restaurant"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
