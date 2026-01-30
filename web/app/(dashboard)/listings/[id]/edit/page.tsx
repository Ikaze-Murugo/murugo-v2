"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { propertyApi, uploadApi } from "@/lib/api/endpoints";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PropertyType, TransactionType, PropertyStatus } from "@/lib/types";
import { toast } from "@/lib/hooks/use-toast";
import { ArrowLeft, Upload, X } from "lucide-react";

const propertySchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  propertyType: z.nativeEnum(PropertyType),
  transactionType: z.nativeEnum(TransactionType),
  price: z.number().min(1, "Price must be greater than 0"),
  currency: z.string().default("RWF"),
  district: z.string().min(2, "District is required"),
  sector: z.string().min(2, "Sector is required"),
  cell: z.string().optional(),
  address: z.string().min(5, "Address is required"),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  bedrooms: z.number().optional(),
  bathrooms: z.number().optional(),
  sizeSqm: z.number().optional(),
  amenities: z.string().optional(),
  status: z.nativeEnum(PropertyStatus),
});

type PropertyFormData = z.infer<typeof propertySchema>;

export default function EditPropertyPage() {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const propertyId = params.id as string;

  const [newImages, setNewImages] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const { data: property, isLoading } = useQuery({
    queryKey: ["property", propertyId],
    queryFn: () => propertyApi.getById(propertyId),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
  });

  // Populate form when property data loads
  useEffect(() => {
    if (property) {
      reset({
        title: property.title,
        description: property.description,
        propertyType: property.propertyType,
        transactionType: property.transactionType,
        price: property.price,
        currency: property.currency,
        district: property.location.district,
        sector: property.location.sector,
        cell: property.location.cell,
        address: property.location.address,
        latitude: property.location.latitude,
        longitude: property.location.longitude,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        sizeSqm: property.sizeSqm,
        amenities: property.amenities?.join(", ") || "",
        status: property.status,
      });

      // Set existing images
      if (property.media) {
        setExistingImages(property.media.map((m) => m.url));
      }
    }
  }, [property, reset]);

  const updateMutation = useMutation({
    mutationFn: async (data: PropertyFormData) => {
      // Upload new images if any
      let newImageUrls: string[] = [];
      if (newImages.length > 0) {
        setIsUploading(true);
        try {
          newImageUrls = await uploadApi.uploadMultiple(newImages);
        } catch (error) {
          throw new Error("Failed to upload images");
        } finally {
          setIsUploading(false);
        }
      }

      // Combine existing and new images
      const allImageUrls = [...existingImages, ...newImageUrls];

      // Create property data
      const amenitiesList = data.amenities
        ? data.amenities.split(",").map((a) => a.trim()).filter(Boolean)
        : [];

      const propertyData = {
        title: data.title,
        description: data.description,
        propertyType: data.propertyType,
        transactionType: data.transactionType,
        price: data.price,
        currency: data.currency,
        location: {
          district: data.district,
          sector: data.sector,
          cell: data.cell || "",
          address: data.address,
          latitude: data.latitude || 0,
          longitude: data.longitude || 0,
        },
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        sizeSqm: data.sizeSqm,
        amenities: amenitiesList,
        status: data.status,
        media: allImageUrls.map((url) => ({ url, type: "image" as const })),
      };

      return propertyApi.update(propertyId, propertyData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["property", propertyId] });
      queryClient.invalidateQueries({ queryKey: ["my-properties"] });
      toast({
        title: "Property updated!",
        description: "Your changes have been saved successfully.",
      });
      router.push("/dashboard/listings");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update property. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleNewImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const totalImages = existingImages.length + newImages.length + files.length;

    if (totalImages > 10) {
      toast({
        title: "Too many images",
        description: "You can have a maximum of 10 images.",
        variant: "destructive",
      });
      return;
    }

    setNewImages([...newImages, ...files]);

    // Generate previews
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewImagePreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(existingImages.filter((_, i) => i !== index));
  };

  const removeNewImage = (index: number) => {
    setNewImages(newImages.filter((_, i) => i !== index));
    setNewImagePreviews(newImagePreviews.filter((_, i) => i !== index));
  };

  const onSubmit = (data: PropertyFormData) => {
    updateMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
        <p className="mt-4 text-muted-foreground">Loading property...</p>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">Property not found</p>
        <Button onClick={() => router.push("/dashboard/listings")}>
          Back to Listings
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Edit Property</h1>
          <p className="text-muted-foreground">
            Update your property details
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Property Title"
              placeholder="e.g., Modern 3-Bedroom House in Kigali"
              error={errors.title?.message}
              {...register("title")}
              required
            />

            <div>
              <label className="block text-sm font-medium mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                className="w-full px-3 py-2 border rounded-md min-h-[120px]"
                placeholder="Describe your property in detail..."
                {...register("description")}
              />
              {errors.description && (
                <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Property Type <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full px-3 py-2 border rounded-md"
                  {...register("propertyType")}
                >
                  {Object.values(PropertyType).map((type) => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Transaction Type <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full px-3 py-2 border rounded-md"
                  {...register("transactionType")}
                >
                  {Object.values(TransactionType).map((type) => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <Input
                  label="Price"
                  type="number"
                  placeholder="e.g., 500000"
                  error={errors.price?.message}
                  {...register("price", { valueAsNumber: true })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Currency</label>
                <select
                  className="w-full px-3 py-2 border rounded-md"
                  {...register("currency")}
                >
                  <option value="RWF">RWF</option>
                  <option value="USD">USD</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                className="w-full px-3 py-2 border rounded-md"
                {...register("status")}
              >
                {Object.values(PropertyStatus).map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle>Location</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="District"
                placeholder="e.g., Gasabo"
                error={errors.district?.message}
                {...register("district")}
                required
              />
              <Input
                label="Sector"
                placeholder="e.g., Kacyiru"
                error={errors.sector?.message}
                {...register("sector")}
                required
              />
            </div>

            <Input
              label="Cell"
              placeholder="e.g., Kamatamu (optional)"
              error={errors.cell?.message}
              {...register("cell")}
            />

            <Input
              label="Street Address"
              placeholder="e.g., KG 123 St"
              error={errors.address?.message}
              {...register("address")}
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Latitude (optional)"
                type="number"
                step="any"
                placeholder="e.g., -1.9536"
                error={errors.latitude?.message}
                {...register("latitude", { valueAsNumber: true })}
              />
              <Input
                label="Longitude (optional)"
                type="number"
                step="any"
                placeholder="e.g., 30.0606"
                error={errors.longitude?.message}
                {...register("longitude", { valueAsNumber: true })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Details */}
        <Card>
          <CardHeader>
            <CardTitle>Property Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Bedrooms"
                type="number"
                placeholder="e.g., 3"
                error={errors.bedrooms?.message}
                {...register("bedrooms", { valueAsNumber: true })}
              />
              <Input
                label="Bathrooms"
                type="number"
                placeholder="e.g., 2"
                error={errors.bathrooms?.message}
                {...register("bathrooms", { valueAsNumber: true })}
              />
              <Input
                label="Size (m²)"
                type="number"
                placeholder="e.g., 150"
                error={errors.sizeSqm?.message}
                {...register("sizeSqm", { valueAsNumber: true })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Amenities (comma-separated)
              </label>
              <Input
                placeholder="e.g., WiFi, Parking, Garden, Security"
                error={errors.amenities?.message}
                {...register("amenities")}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Separate amenities with commas
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Images */}
        <Card>
          <CardHeader>
            <CardTitle>Property Images</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Existing Images */}
            {existingImages.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Current Images
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {existingImages.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Existing ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(index)}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Images */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Add New Images (Max {10 - existingImages.length} more)
              </label>
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground mb-4">
                  Click to upload or drag and drop
                </p>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleNewImageChange}
                  className="hidden"
                  id="image-upload"
                  disabled={existingImages.length + newImages.length >= 10}
                />
                <label htmlFor="image-upload">
                  <Button
                    type="button"
                    variant="outline"
                    asChild
                    disabled={existingImages.length + newImages.length >= 10}
                  >
                    <span>Choose Files</span>
                  </Button>
                </label>
              </div>
            </div>

            {newImagePreviews.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  New Images to Upload
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {newImagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`New ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeNewImage(index)}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/dashboard/listings")}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={updateMutation.isPending || isUploading}
          >
            {updateMutation.isPending || isUploading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent mr-2" />
                {isUploading ? "Uploading..." : "Saving..."}
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
