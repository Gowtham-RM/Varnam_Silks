import { toast } from "sonner";

/**
 * Uploads a file to Cloudinary and returns the URL.
 * NOTE: You must set up your Cloudinary Cloud Name and Upload Preset in your environment variables or hardcode them here.
 */
export const uploadToCloudinary = async (file: File): Promise<string> => {
    // CONFIGURATION: Replace these with your actual Cloudinary details
    // You can find these in your Cloudinary Dashboard
    const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "your_cloud_name";
    const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "your_upload_preset";

    if (CLOUD_NAME === "your_cloud_name" || UPLOAD_PRESET === "your_upload_preset") {
        toast.error("Cloudinary not configured. Please check your settings.");
        throw new Error("Cloudinary configuration missing");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    try {
        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
            {
                method: "POST",
                body: formData,
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || "Upload failed");
        }

        const data = await response.json();
        return data.secure_url;
    } catch (error) {
        console.error("Error uploading to Cloudinary:", error);
        toast.error("Failed to upload image");
        throw error;
    }
};
