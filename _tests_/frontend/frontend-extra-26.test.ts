// @ts-nocheck
import {
  getAdminUsers,
  getAdminRestaurants,
  deleteAdminUser,
  getAdminUserById,
  updateAdminUser,
  deleteAdminRestaurant,
  updateAdminRestaurant,
  updateAdminRestaurantFood,
  addAdminRestaurantFood,
  getAdminAnalytics,
} from "../../lib/admin";
import {
  getRestaurantReviews,
  getTrendingRestaurants,
  getMostSavedRestaurants,
  deleteReview,
  getRecommendations,
} from "../../lib/restaurants";
import { validateImageFile, uploadFileToS3, uploadImage } from "../../lib/upload";

jest.mock("../../lib/api", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
  getAccessToken: jest.fn(() => "test-token"),
}));

const { default: api, getAccessToken } = require("../../lib/api");

describe("Frontend additional tests (26)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("1. getAdminUsers calls /admin/users with params", async () => {
    const payload = { users: [], pagination: { page: 1, totalPages: 1, total: 0, limit: 10 } };
    api.get.mockResolvedValue({ data: { data: payload } });

    await expect(getAdminUsers({ page: 1, limit: 10 })).resolves.toEqual(payload);
    expect(api.get).toHaveBeenCalledWith("/admin/users", { params: { page: 1, limit: 10 } });
  });

  it("2. getAdminRestaurants calls /admin/restaurants with params", async () => {
    const payload = { restaurants: [], pagination: { page: 1, totalPages: 1, total: 0, limit: 10 } };
    api.get.mockResolvedValue({ data: { data: payload } });

    await expect(getAdminRestaurants({ page: 2, limit: 5 })).resolves.toEqual(payload);
    expect(api.get).toHaveBeenCalledWith("/admin/restaurants", { params: { page: 2, limit: 5 } });
  });

  it("3. deleteAdminUser calls delete endpoint", async () => {
    api.delete.mockResolvedValue({});

    await deleteAdminUser("u1");
    expect(api.delete).toHaveBeenCalledWith("/admin/users/u1");
  });

  it("4. getAdminUserById fetches one user", async () => {
    const payload = { _id: "u1", name: "Test" };
    api.get.mockResolvedValue({ data: { data: payload } });

    await expect(getAdminUserById("u1")).resolves.toEqual(payload);
    expect(api.get).toHaveBeenCalledWith("/admin/users/u1");
  });

  it("5. updateAdminUser sends put payload", async () => {
    const payload = { _id: "u1", name: "Updated" };
    api.put.mockResolvedValue({ data: { data: payload } });

    await expect(updateAdminUser("u1", { name: "Updated" })).resolves.toEqual(payload);
    expect(api.put).toHaveBeenCalledWith("/admin/users/u1", { name: "Updated" });
  });

  it("6. deleteAdminRestaurant calls delete endpoint", async () => {
    api.delete.mockResolvedValue({});

    await deleteAdminRestaurant("r1");
    expect(api.delete).toHaveBeenCalledWith("/admin/restaurants/r1");
  });

  it("7. updateAdminRestaurant sends put payload", async () => {
    const payload = { _id: "r1", name: "Rest" };
    api.put.mockResolvedValue({ data: { data: payload } });

    await expect(updateAdminRestaurant("r1", { name: "Rest" })).resolves.toEqual(payload);
    expect(api.put).toHaveBeenCalledWith("/admin/restaurants/r1", { name: "Rest" });
  });

  it("8. updateAdminRestaurantFood updates specific food", async () => {
    const payload = { _id: "r1" };
    api.put.mockResolvedValue({ data: { data: payload } });

    await expect(updateAdminRestaurantFood("r1", "f1", { name: "Momo" })).resolves.toEqual(payload);
    expect(api.put).toHaveBeenCalledWith("/admin/restaurants/r1/foods/f1", { name: "Momo" });
  });

  it("9. addAdminRestaurantFood posts food payload", async () => {
    const payload = { _id: "r1" };
    api.post.mockResolvedValue({ data: { data: payload } });

    await expect(addAdminRestaurantFood("r1", { name: "Burger", price: 250 })).resolves.toEqual(payload);
    expect(api.post).toHaveBeenCalledWith("/admin/restaurants/r1/foods", { name: "Burger", price: 250 });
  });

  it("10. getAdminAnalytics includes period query", async () => {
    const payload = { users: [], restaurants: [], reviews: [], favorites: [] };
    api.get.mockResolvedValue({ data: { data: payload } });

    await expect(getAdminAnalytics("7d")).resolves.toEqual(payload);
    expect(api.get).toHaveBeenCalledWith("/admin/analytics", { params: { period: "7d" } });
  });

  it("11. getAdminAnalytics supports 90d period", async () => {
    const payload = { users: [{ date: "2026-02-01", count: 3 }], restaurants: [], reviews: [], favorites: [] };
    api.get.mockResolvedValue({ data: { data: payload } });

    await expect(getAdminAnalytics("90d")).resolves.toEqual(payload);
  });

  it("12. getRestaurantReviews fetches /restaurants/:id/reviews", async () => {
    const payload = [{ _id: "rev1" }];
    api.get.mockResolvedValue({ data: { data: payload } });

    await expect(getRestaurantReviews("r1")).resolves.toEqual(payload);
    expect(api.get).toHaveBeenCalledWith("/restaurants/r1/reviews");
  });

  it("13. getTrendingRestaurants omits params when limit is 0", async () => {
    const payload: any[] = [];
    api.get.mockResolvedValue({ data: { data: payload } });

    await expect(getTrendingRestaurants(0)).resolves.toEqual(payload);
    expect(api.get).toHaveBeenCalledWith("/restaurants/trending", { params: undefined });
  });

  it("14. getMostSavedRestaurants omits params when limit missing", async () => {
    const payload: any[] = [];
    api.get.mockResolvedValue({ data: { data: payload } });

    await expect(getMostSavedRestaurants()).resolves.toEqual(payload);
    expect(api.get).toHaveBeenCalledWith("/restaurants/most-saved", { params: undefined });
  });

  it("15. deleteReview calls delete endpoint", async () => {
    api.delete.mockResolvedValue({});

    await deleteReview("rev1");
    expect(api.delete).toHaveBeenCalledWith("/reviews/rev1");
  });

  it("16. getRecommendations propagates API rejection", async () => {
    api.get.mockRejectedValue(new Error("network"));

    await expect(getRecommendations()).rejects.toThrow("network");
  });

  it("17. validateImageFile returns null for valid jpeg and size", () => {
    const file = { type: "image/jpeg", size: 1024 } as File;
    expect(validateImageFile(file)).toBeNull();
  });

  it("18. validateImageFile rejects file larger than 5MB", () => {
    const file = { type: "image/png", size: 6 * 1024 * 1024 } as File;
    expect(validateImageFile(file)).toBe("Max file size is 5MB");
  });

  function setupXHR(mode: "success" | "httpError" | "error" | "abort" | "progress") {
    const listeners: Record<string, Function> = {};
    const uploadListeners: Record<string, Function> = {};
    const xhr = {
      status: mode === "success" || mode === "progress" ? 200 : 500,
      upload: {
        addEventListener: jest.fn((event: string, cb: Function) => {
          uploadListeners[event] = cb;
        }),
      },
      addEventListener: jest.fn((event: string, cb: Function) => {
        listeners[event] = cb;
      }),
      open: jest.fn(),
      setRequestHeader: jest.fn(),
      send: jest.fn(() => {
        if (mode === "progress" && uploadListeners.progress) {
          uploadListeners.progress({ lengthComputable: true, loaded: 50, total: 100 });
          listeners.load && listeners.load();
          return;
        }
        if (mode === "success") {
          listeners.load && listeners.load();
          return;
        }
        if (mode === "httpError") {
          listeners.load && listeners.load();
          return;
        }
        if (mode === "error") {
          listeners.error && listeners.error();
          return;
        }
        listeners.abort && listeners.abort();
      }),
    };

    const ctor = jest.fn(() => xhr);
    (global as any).XMLHttpRequest = ctor;
    return { xhr, ctor };
  }

  it("19. uploadFileToS3 opens PUT and sets content-type", async () => {
    const { xhr } = setupXHR("success");
    const file = { type: "image/webp" } as File;

    await uploadFileToS3("https://upload.url", file);

    expect(xhr.open).toHaveBeenCalledWith("PUT", "https://upload.url");
    expect(xhr.setRequestHeader).toHaveBeenCalledWith("Content-Type", "image/webp");
  });

  it("20. uploadFileToS3 resolves on successful upload", async () => {
    setupXHR("success");
    const file = { type: "image/jpeg" } as File;

    await expect(uploadFileToS3("https://upload.url", file)).resolves.toBeUndefined();
  });

  it("21. uploadFileToS3 rejects on non-2xx load", async () => {
    setupXHR("httpError");
    const file = { type: "image/jpeg" } as File;

    await expect(uploadFileToS3("https://upload.url", file)).rejects.toThrow("Upload failed: 500");
  });

  it("22. uploadFileToS3 rejects on xhr error", async () => {
    setupXHR("error");
    const file = { type: "image/jpeg" } as File;

    await expect(uploadFileToS3("https://upload.url", file)).rejects.toThrow("Upload failed");
  });

  it("23. uploadFileToS3 rejects on xhr abort", async () => {
    setupXHR("abort");
    const file = { type: "image/jpeg" } as File;

    await expect(uploadFileToS3("https://upload.url", file)).rejects.toThrow("Upload aborted");
  });

  it("24. uploadFileToS3 reports upload progress", async () => {
    setupXHR("progress");
    const file = { type: "image/jpeg" } as File;
    const onProgress = jest.fn();

    await uploadFileToS3("https://upload.url", file, onProgress);

    expect(onProgress).toHaveBeenCalledWith(50);
  });

  it("25. uploadImage throws when file validation fails", async () => {
    const badFile = { type: "application/pdf", size: 100 } as File;

    await expect(uploadImage(badFile, "restaurants")).rejects.toThrow("Allowed types: JPEG, PNG, WebP");
  });

  it("26. uploadImage sends auth header and returns url", async () => {
    class FormDataMock {
      entries: Array<[string, unknown]> = [];
      append(key: string, value: unknown) {
        this.entries.push([key, value]);
      }
    }
    (global as any).FormData = FormDataMock as any;

    const file = { type: "image/png", size: 1024 } as File;
    api.post.mockResolvedValue({
      data: { success: true, data: { url: "https://cdn.example.com/img.png" } },
    });

    const result = await uploadImage(file, "foods");

    expect(getAccessToken).toHaveBeenCalled();
    expect(api.post).toHaveBeenCalledWith(
      "/upload/cloudinary",
      expect.any(FormDataMock),
      expect.objectContaining({ headers: { Authorization: "Bearer test-token" } })
    );
    expect(result).toBe("https://cdn.example.com/img.png");
  });
});
