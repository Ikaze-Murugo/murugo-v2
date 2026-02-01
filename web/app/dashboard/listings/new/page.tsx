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
import { RWANDA_LOCATIONS } from "@/lib/data/rwanda-locations";
import { AMENITIES_BY_CATEGORY, AMENITY_CATEGORIES } from "@/lib/data/amenities";
import {
  ArrowLeft,
  ArrowRight,
  Upload,
  X,
  Home,
  Building2,
  Landmark,
  Warehouse,
  TreePine,
  Building,
  Store,
  Castle,
  DollarSign,
  GripVertical,
} from "lucide-react";

const TITLE_MIN = 10;
const TITLE_MAX = 80;
const DESC_MIN = 50;
const DESC_MAX = 2000;

const propertySchema = z.object({
  title: z
    .string()
    .min(TITLE_MIN, `Title must be at least ${TITLE_MIN} characters`)
    .max(TITLE_MAX, `Title must be at most ${TITLE_MAX} characters`),
  description: z
    .string()
    .min(DESC_MIN, `Description must be at least ${DESC_MIN} characters`)
    .max(DESC_MAX, `Description must be at most ${DESC_MAX} characters`),
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
  status: z.nativeEnum(PropertyStatus),
});

type PropertyFormData = z.infer<typeof propertySchema>;

const IMAGE_MIN = 3;
const IMAGE_MAX = 20;

const STEPS = [
  { id: 1, title: "Basic Info", description: "Property details" },
  { id: 2, title: "Location", description: "Where is it located?" },
  { id: 3, title: "Details", description: "Additional information" },
  { id: 4, title: "Photos", description: `Upload photos (min ${IMAGE_MIN})` },
];

const PROPERTY_TYPE_ICONS: Record<string, React.ReactNode> = {
  house: <Home className="h-5 w-5" />,
  apartment: <Building2 className="h-5 w-5" />,
  office: <Landmark className="h-5 w-5" />,
  commercial: <Store className="h-5 w-5" />,
  land: <TreePine className="h-5 w-5" />,
  studio: <Building className="h-5 w-5" />,
  villa: <Castle className="h-5 w-5" />,
};

const DESCRIPTION_TEMPLATE = `This property is located in a convenient area with good access to amenities.

Features:
- Spacious and well-maintained
- Secure and accessible
- Ideal for families or professionals

Contact for viewings and more details.`;

export default function AddPropertyPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [provinceId, setProvinceId] = useState<string>("");
  const [districtId, setDistrictId] = useState<string>("");
  const [sectorId, setSectorId] = useState<string>("");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [customAmenity, setCustomAmenity] = useState("");
  const [showAdvancedCoords, setShowAdvancedCoords] = useState(false);
  const [paymentTerms, setPaymentTerms] = useState<"monthly" | "yearly">("monthly");
  const [googleMapsLink, setGoogleMapsLink] = useState("");
  const [imageDragOver, setImageDragOver] = useState(false);

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
    setValue,
    watch,
  } = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      currency: "RWF",
      status: PropertyStatus.AVAILABLE,
      district: "",
      sector: "",
      cell: "",
    },
  });

  const watchedTitle = watch("title", "");
  const watchedDescription = watch("description", "");
  const watchedPropertyType = watch("propertyType");
  const watchedTransactionType = watch("transactionType");
  const watchedPrice = watch("price");

  const currentProvince = RWANDA_LOCATIONS.find((p) => p.id === provinceId);
  const currentDistricts = currentProvince?.districts ?? [];
  const currentDistrict = currentDistricts.find((d) => d.id === districtId);
  const currentSectors = currentDistrict?.sectors ?? [];
  const currentSector = currentSectors.find((s) => s.id === sectorId);
  const currentCells = currentSector?.cells ?? [];

  const handleProvinceChange = (id: string) => {
    setProvinceId(id);
    setDistrictId("");
    setSectorId("");
    setValue("district", "");
    setValue("sector", "");
    setValue("cell", "");
  };
  const handleDistrictChange = (id: string, name: string) => {
    setDistrictId(id);
    setSectorId("");
    setValue("district", name);
    setValue("sector", "");
    setValue("cell", "");
  };
  const handleSectorChange = (id: string, name: string) => {
    setSectorId(id);
    setValue("sector", name);
    setValue("cell", "");
  };
  const handleCellChange = (id: string, name: string) => {
    setValue("cell", name);
  };

  const toggleAmenity = (label: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(label) ? prev.filter((a) => a !== label) : [...prev, label]
    );
  };
  const addCustomAmenity = () => {
    const trimmed = customAmenity.trim();
    if (trimmed && !selectedAmenities.includes(trimmed)) {
      setSelectedAmenities((prev) => [...prev, trimmed]);
      setCustomAmenity("");
    }
  };
  const removeCustomAmenity = (label: string) => {
    setSelectedAmenities((prev) => prev.filter((a) => a !== label));
  };

  const createMutation = useMutation({
    mutationFn: async (data: PropertyFormData) => {
      // 1. Upload images first (to Cloudinary)
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

      // 2. Create property
      const amenitiesList = selectedAmenities.length > 0 ? selectedAmenities : [];

      const lat = typeof data.latitude === "number" && !Number.isNaN(data.latitude) ? data.latitude : 0;
      const lng = typeof data.longitude === "number" && !Number.isNaN(data.longitude) ? data.longitude : 0;

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
          cell: data.cell ?? "",
          address: data.address,
          latitude: lat,
          longitude: lng,
        },
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        sizeSqm: data.sizeSqm,
        amenities: amenitiesList,
        status: data.status,
      };

      const property = await propertyApi.create(propertyData);

      // 3. Attach uploaded image URLs to the new property
      if (imageUrls.length > 0 && property?.id) {
        await propertyApi.addMedia(property.id, imageUrls);
      }

      return property;
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

  // Map form fields to the step that contains them (so we can jump to first error)
  const fieldToStep: Record<string, number> = {
    title: 1,
    description: 1,
    propertyType: 1,
    transactionType: 1,
    price: 1,
    currency: 1,
    district: 2,
    sector: 2,
    cell: 2,
    address: 2,
    latitude: 2,
    longitude: 2,
    bedrooms: 3,
    bathrooms: 3,
    sizeSqm: 3,
    amenities: 3,
    status: 3,
  };

  const onInvalid = (errors: Record<string, { message?: string }>) => {
    const firstErrorField = Object.keys(errors)[0];
    const step = firstErrorField ? fieldToStep[firstErrorField] ?? 1 : 1;
    setCurrentStep(step);
    toast({
      title: "Complete required fields",
      description: "Please fix the highlighted fields and try again.",
      variant: "destructive",
    });
  };

  const onSubmit = (data: PropertyFormData) => {
    if (currentStep === 4 && images.length < IMAGE_MIN) {
      toast({
        title: `Add at least ${IMAGE_MIN} photos`,
        description: `Property listings need at least ${IMAGE_MIN} photos.`,
        variant: "destructive",
      });
      return;
    }
    createMutation.mutate(data);
  };

  const addImageFiles = (files: File[]) => {
    const valid = files.filter((f) => f.type.startsWith("image/"));
    if (valid.length + images.length > IMAGE_MAX) {
      toast({
        title: "Too many images",
        description: `You can upload up to ${IMAGE_MAX} images.`,
        variant: "destructive",
      });
      return;
    }
    setImages((prev) => [...prev, ...valid]);
    valid.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    addImageFiles(Array.from(e.target.files || []));
    e.target.value = "";
  };

  const handleImageDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setImageDragOver(false);
    addImageFiles(Array.from(e.dataTransfer.files || []));
  };

  const handleImageDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setImageDragOver(true);
  };

  const handleImageDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setImageDragOver(false);
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  const moveImage = (from: number, to: number) => {
    if (to < 0 || to >= images.length) return;
    const newImages = [...images];
    const newPreviews = [...imagePreviews];
    const [img] = newImages.splice(from, 1);
    const [prev] = newPreviews.splice(from, 1);
    newImages.splice(to, 0, img);
    newPreviews.splice(to, 0, prev);
    setImages(newImages);
    setImagePreviews(newPreviews);
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

      {/* Progress Steps - sticky so section number stays visible when scrolling (below mobile header on small screens) */}
      <div className="sticky top-14 lg:top-0 z-10 py-3 -mx-4 px-4 lg:-mx-8 lg:px-8 bg-background/95 backdrop-blur border-b shadow-sm flex items-center justify-between">
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
      <form onSubmit={handleSubmit(onSubmit, onInvalid)}>
        <Card>
          <CardHeader>
            <CardTitle>{STEPS[currentStep - 1].title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Property Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="e.g., Modern 2-Bedroom Apartment in Kimihurura"
                    maxLength={TITLE_MAX}
                    {...register("title")}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {watchedTitle.length}/{TITLE_MAX} characters
                  </p>
                  {errors.title && (
                    <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    Make it descriptive and catchy to attract more views
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border rounded-md min-h-[140px]"
                    placeholder="Describe your property... What makes it special? Nearby landmarks? Unique features?"
                    maxLength={DESC_MAX}
                    {...register("description")}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {watchedDescription.length}/{DESC_MAX} characters
                  </p>
                  {errors.description && (
                    <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => setValue("description", DESCRIPTION_TEMPLATE)}
                  >
                    Use template
                  </Button>
                </div>

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
                  <div className="flex flex-wrap gap-2 mt-2">
                    {Object.values(PropertyType).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setValue("propertyType", type)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm ${
                          watchedPropertyType === type
                            ? "border-[#949DDB] bg-[#949DDB] text-white"
                            : "border-input hover:bg-muted"
                        }`}
                      >
                        {PROPERTY_TYPE_ICONS[type] ?? <Building2 className="h-4 w-4" />}
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </button>
                    ))}
                  </div>
                  {errors.propertyType && (
                    <p className="text-sm text-red-500 mt-1">{errors.propertyType.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Transaction Type <span className="text-red-500">*</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: TransactionType.RENT, label: "For Rent", emoji: "💰" },
                      { value: TransactionType.SALE, label: "For Sale", emoji: "🏷️" },
                      { value: TransactionType.LEASE, label: "For Lease", emoji: "📄" },
                    ].map(({ value, label, emoji }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setValue("transactionType", value)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium ${
                          watchedTransactionType === value
                            ? "border-[#949DDB] bg-[#949DDB] text-white"
                            : "border-input hover:bg-muted"
                        }`}
                      >
                        <span>{emoji}</span>
                        {label}
                      </button>
                    ))}
                  </div>
                  {errors.transactionType && (
                    <p className="text-sm text-red-500 mt-1">{errors.transactionType.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Price <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <select
                      className="w-24 px-3 py-2 border rounded-md"
                      {...register("currency")}
                    >
                      <option value="RWF">RWF</option>
                      <option value="USD">USD</option>
                    </select>
                    <input
                      type="number"
                      className="flex-1 px-3 py-2 border rounded-md"
                      placeholder="e.g., 350000"
                      min={1}
                      {...register("price", { valueAsNumber: true })}
                    />
                  </div>
                  {errors.price && (
                    <p className="text-sm text-red-500 mt-1">{errors.price.message}</p>
                  )}
                  {watchedTransactionType === TransactionType.RENT && (
                    <div className="flex gap-4 mt-2">
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="radio"
                          checked={paymentTerms === "monthly"}
                          onChange={() => setPaymentTerms("monthly")}
                        />
                        Monthly
                      </label>
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="radio"
                          checked={paymentTerms === "yearly"}
                          onChange={() => setPaymentTerms("yearly")}
                        />
                        Yearly
                      </label>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Step 2: Location */}
            {currentStep === 2 && (
              <>
                <p className="text-sm text-muted-foreground mb-4">
                  Where is your property located?
                </p>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Province / City <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full px-3 py-2 border rounded-md"
                    value={provinceId}
                    onChange={(e) => handleProvinceChange(e.target.value)}
                  >
                    <option value="">Select province</option>
                    {RWANDA_LOCATIONS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                {currentDistricts.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      District <span className="text-red-500">*</span>
                    </label>
                    <select
                      className="w-full px-3 py-2 border rounded-md"
                      value={districtId}
                      onChange={(e) => {
                        const d = currentDistricts.find((x) => x.id === e.target.value);
                        if (d) handleDistrictChange(d.id, d.name);
                      }}
                    >
                      <option value="">Select district</option>
                      {currentDistricts.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                    {errors.district && (
                      <p className="text-sm text-red-500 mt-1">{errors.district.message}</p>
                    )}
                  </div>
                )}

                {currentSectors.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Sector <span className="text-red-500">*</span>
                    </label>
                    <select
                      className="w-full px-3 py-2 border rounded-md"
                      value={sectorId}
                      onChange={(e) => {
                        const s = currentSectors.find((x) => x.id === e.target.value);
                        if (s) handleSectorChange(s.id, s.name);
                      }}
                    >
                      <option value="">Select sector</option>
                      {currentSectors.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                    {errors.sector && (
                      <p className="text-sm text-red-500 mt-1">{errors.sector.message}</p>
                    )}
                  </div>
                )}

                {currentCells.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Cell (optional)</label>
                    <select
                      className="w-full px-3 py-2 border rounded-md"
                      onChange={(e) => {
                        const c = currentCells.find((x) => x.id === e.target.value);
                        if (c) handleCellChange(c.id, c.name);
                      }}
                    >
                      <option value="">Select cell</option>
                      {currentCells.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <Input
                  label="Street Address"
                  placeholder="e.g., KN 5 Ave, House #12 or nearby landmark"
                  error={errors.address?.message}
                  {...register("address")}
                  required
                />

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Google Maps Link (optional)
                  </label>
                  <input
                    type="url"
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="https://maps.google.com/..."
                    value={googleMapsLink}
                    onChange={(e) => setGoogleMapsLink(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Paste a Google Maps share link to help buyers find your property
                  </p>
                </div>

                <div>
                  <button
                    type="button"
                    className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-2"
                    onClick={() => setShowAdvancedCoords(!showAdvancedCoords)}
                  >
                    {showAdvancedCoords ? "▼" : "▶"} Advanced: Add exact coordinates
                  </button>
                  {showAdvancedCoords && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                      <Input
                        label="Latitude"
                        type="number"
                        step="any"
                        placeholder="e.g., -1.9536"
                        error={errors.latitude?.message}
                        {...register("latitude", { valueAsNumber: true })}
                      />
                      <Input
                        label="Longitude"
                        type="number"
                        step="any"
                        placeholder="e.g., 30.0606"
                        error={errors.longitude?.message}
                        {...register("longitude", { valueAsNumber: true })}
                      />
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Step 3: Details */}
            {currentStep === 3 && (
              <>
                <p className="text-sm text-muted-foreground mb-4">
                  Bedrooms, bathrooms, size, and amenities help buyers find the right fit.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Bedrooms</label>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          setValue(
                            "bedrooms",
                            Math.max(0, (getValues("bedrooms") ?? 0) - 1)
                          )
                        }
                      >
                        −
                      </Button>
                      <input
                        type="number"
                        min={0}
                        className="w-20 px-3 py-2 border rounded-md text-center"
                        {...register("bedrooms", { valueAsNumber: true })}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          setValue("bedrooms", (getValues("bedrooms") ?? 0) + 1)
                        }
                      >
                        +
                      </Button>
                    </div>
                    {errors.bedrooms && (
                      <p className="text-sm text-red-500 mt-1">{errors.bedrooms.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Bathrooms</label>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          setValue(
                            "bathrooms",
                            Math.max(0, (getValues("bathrooms") ?? 0) - 1)
                          )
                        }
                      >
                        −
                      </Button>
                      <input
                        type="number"
                        min={0}
                        className="w-20 px-3 py-2 border rounded-md text-center"
                        {...register("bathrooms", { valueAsNumber: true })}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          setValue("bathrooms", (getValues("bathrooms") ?? 0) + 1)
                        }
                      >
                        +
                      </Button>
                    </div>
                    {errors.bathrooms && (
                      <p className="text-sm text-red-500 mt-1">{errors.bathrooms.message}</p>
                    )}
                  </div>
                  <Input
                    label="Size (m²)"
                    type="number"
                    min={0}
                    placeholder="e.g., 150"
                    error={errors.sizeSqm?.message}
                    {...register("sizeSqm", { valueAsNumber: true })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Amenities
                  </label>
                  <p className="text-xs text-muted-foreground mb-3">
                    Select all that apply. Add custom ones if needed.
                  </p>
                  <div className="space-y-4 max-h-[280px] overflow-y-auto pr-2">
                    {AMENITY_CATEGORIES.map((cat) => (
                      <div key={cat.id}>
                        <p className="text-xs font-medium text-muted-foreground mb-2">
                          {cat.label}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {(AMENITIES_BY_CATEGORY[cat.id] ?? []).map((opt) => (
                            <label
                              key={opt.id}
                              className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer text-sm ${
                                selectedAmenities.includes(opt.label)
                                  ? "border-[#949DDB] bg-[#949DDB] text-white"
                                  : "border-input hover:bg-muted"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={selectedAmenities.includes(opt.label)}
                                onChange={() => toggleAmenity(opt.label)}
                                className="sr-only"
                              />
                              {opt.label}
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-3">
                    <input
                      type="text"
                      className="flex-1 px-3 py-2 border rounded-md text-sm"
                      placeholder="Add custom amenity"
                      value={customAmenity}
                      onChange={(e) => setCustomAmenity(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomAmenity())}
                    />
                    <Button type="button" variant="outline" size="sm" onClick={addCustomAmenity}>
                      Add
                    </Button>
                  </div>
                  {selectedAmenities.some((a) => !AMENITY_CATEGORIES.some((c) => AMENITIES_BY_CATEGORY[c.id]?.some((x) => x.label === a))) && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedAmenities
                        .filter(
                          (a) =>
                            !AMENITY_CATEGORIES.some((c) =>
                              AMENITIES_BY_CATEGORY[c.id]?.some((x) => x.label === a)
                            )
                        )
                        .map((label) => (
                          <span
                            key={label}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-muted text-sm"
                          >
                            {label}
                            <button
                              type="button"
                              onClick={() => removeCustomAmenity(label)}
                              className="hover:text-destructive"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Status</label>
                  <div className="flex flex-wrap gap-2">
                    {Object.values(PropertyStatus).map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setValue("status", status)}
                        className={`px-4 py-2 rounded-lg border text-sm font-medium ${
                          watch("status") === status
                            ? "border-[#949DDB] bg-[#949DDB] text-white"
                            : "border-input hover:bg-muted"
                        }`}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Step 4: Images (no drafts, no per-image tags) */}
            {currentStep === 4 && (
              <>
                <p className="text-sm text-muted-foreground mb-4">
                  Add at least {IMAGE_MIN} photos (max {IMAGE_MAX}). First image will be the cover. You can reorder by dragging.
                </p>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Property Images
                  </label>
                  <div
                    onDragOver={handleImageDragOver}
                    onDragLeave={handleImageDragLeave}
                    onDrop={handleImageDrop}
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                      imageDragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25"
                    }`}
                  >
                    <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-sm text-muted-foreground mb-4">
                      Drag and drop images here, or click to choose files
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
                    <p className="text-xs text-muted-foreground mt-2">
                      {images.length} / {IMAGE_MAX} — minimum {IMAGE_MIN} required
                    </p>
                  </div>
                </div>

                {imagePreviews.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Uploaded images (drag to reorder)</p>
                    <ul className="grid grid-cols-2 md:grid-cols-4 gap-4 list-none p-0 m-0">
                      {imagePreviews.map((preview, index) => (
                        <li key={index} className="relative group flex items-start gap-2">
                          <span className="cursor-grab active:cursor-grabbing touch-none flex items-center justify-center w-8 h-32 rounded-l-lg bg-muted shrink-0" title="Drag to reorder">
                            <GripVertical className="h-5 w-5 text-muted-foreground" />
                          </span>
                          <div className="relative flex-1 min-w-0">
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-32 object-cover rounded-r-lg"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-4 w-4" />
                            </button>
                            <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/60 text-white text-xs">
                              {index + 1}
                            </span>
                          </div>
                          <div className="flex flex-col gap-1 shrink-0">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => moveImage(index, index - 1)}
                              disabled={index === 0}
                            >
                              ↑
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => moveImage(index, index + 1)}
                              disabled={index === imagePreviews.length - 1}
                            >
                              ↓
                            </Button>
                          </div>
                        </li>
                      ))}
                    </ul>
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
