"use client";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "@tanstack/react-query";
import { propertyApi, uploadApi } from "@/lib/api/endpoints";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PropertyType, TransactionType, PropertyStatus } from "@/lib/types";
import { toast } from "@/lib/hooks/use-toast";
import { useAuth } from "@/lib/hooks/use-auth";
import { ArrowLeft, ArrowRight, Upload, X } from "lucide-react";

const propertySchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  propertyType: z.nativeEnum(PropertyType),
  transactionType: z.nativeEnum(TransactionType),
  price: z.number().min(1, "Price must be greater than 0"),
  currency: z.string(),
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

const STEPS = [
  { id: 1, title: "Basic Info", description: "Property details" },
  { id: 2, title: "Location", description: "Where is it located?" },
  { id: 3, title: "Details", description: "Additional information" },
  { id: 4, title: "Images", description: "Upload photos" },
];

export default function AddPropertyPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (user && user.role !== "lister" && user.role !== "admin") {
      toast({
        title: "Access restricted",
        description: "Only listers can create property listings.",
        variant: "destructive",
      });
      router.replace("/dashboard");
    }
  }, [user, router]);

  const canCreate = user?.role === "lister" || user?.role === "admin";

  if (user && !canCreate) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
      </div>
    );
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
    getValues,
  } = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      currency: "RWF",
      status: PropertyStatus.AVAILABLE,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: PropertyFormData) => {
      // Upload images first
      let imageUrls: string[] = [];
      if (images.length > 0) {
        setIsUploading(true);
        try {
          imageUrls = await uploadApi.uploadMultiple(images);
        } catch (error) {
          throw new Error("Failed to upload images");
        } finally {
          setIsUploading(false);
        }
      }

      // Create property
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
        // Note: media is handled separately via image upload endpoints
        // The backend expects full PropertyMedia objects with id, propertyId, order, createdAt
        // which we don't have when creating. Images are managed through separate upload endpoints.
      };

      return propertyApi.create(propertyData);
    },
    onSuccess: () => {
      toast({
        title: "Property created!",
        description: "Your property has been listed successfully.",
      });
      router.push("/dashboard/listings");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create property. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleNext = async () => {
    let fieldsToValidate: (keyof PropertyFormData)[] = [];

    if (currentStep === 1) {
      fieldsToValidate = ["title", "description", "propertyType", "transactionType", "price"];
    } else if (currentStep === 2) {
      fieldsToValidate = ["district", "sector", "address"];
    }

    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length > 10) {
      toast({
        title: "Too many images",
        description: "You can upload a maximum of 10 images.",
        variant: "destructive",
      });
      return;
    }

    setImages([...images, ...files]);

    // Generate previews
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  const onSubmit = (data: PropertyFormData) => {
    createMutation.mutate(data);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Add New Property</h1>
          <p className="text-muted-foreground">
            Fill in the details to list your property
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between">
        {STEPS.map((step, index) => (
          <div key={step.id} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-semibold
                  ${
                    currentStep >= step.id
                      ? "bg-primary text-white"
                      : "bg-muted text-muted-foreground"
                  }
                `}
              >
                {step.id}
              </div>
              <div className="mt-2 text-center">
                <p className="text-sm font-medium">{step.title}</p>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  {step.description}
                </p>
              </div>
            </div>
            {index < STEPS.length - 1 && (
              <div
                className={`
                  h-1 flex-1 mx-2
                  ${currentStep > step.id ? "bg-primary" : "bg-muted"}
                `}
              />
            )}
          </div>
        ))}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>{STEPS[currentStep - 1].title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <>
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
                      <option value="">Select type</option>
                      {Object.values(PropertyType).map((type) => (
                        <option key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </option>
                      ))}
                    </select>
                    {errors.propertyType && (
                      <p className="text-sm text-red-500 mt-1">{errors.propertyType.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Transaction Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      className="w-full px-3 py-2 border rounded-md"
                      {...register("transactionType")}
                    >
                      <option value="">Select type</option>
                      {Object.values(TransactionType).map((type) => (
                        <option key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </option>
                      ))}
                    </select>
                    {errors.transactionType && (
                      <p className="text-sm text-red-500 mt-1">{errors.transactionType.message}</p>
                    )}
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
              </>
            )}

            {/* Step 2: Location */}
            {currentStep === 2 && (
              <>
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
              </>
            )}

            {/* Step 3: Details */}
            {currentStep === 3 && (
              <>
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
              </>
            )}

            {/* Step 4: Images */}
            {currentStep === 4 && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Property Images (Max 10)
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
                      onChange={handleImageChange}
                      className="hidden"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload">
                      <Button type="button" variant="outline" asChild>
                        <span>Choose Files</span>
                      </Button>
                    </label>
                  </div>
                </div>

                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          {currentStep < STEPS.length ? (
            <Button type="button" onClick={handleNext}>
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={createMutation.isPending || isUploading}
            >
              {createMutation.isPending || isUploading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent mr-2" />
                  {isUploading ? "Uploading..." : "Creating..."}
                </>
              ) : (
                "Create Property"
              )}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
