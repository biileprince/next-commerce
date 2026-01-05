"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createProduct, updateProduct } from "@/lib/actions/product";
import { toast } from "sonner";

interface ProductFormProps {
  categories: { id: string; name: string }[];
  product?: {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    price: number;
    stockQuantity: number;
    categoryId?: string | null;
    images: string[];
  };
}

export function ProductForm({ categories, product }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>(product?.images || []);
  const [imageInput, setImageInput] = useState("");

  const isEdit = !!product;

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const slugInput =
      document.querySelector<HTMLInputElement>('input[name="slug"]');
    if (slugInput && !isEdit) {
      slugInput.value = generateSlug(name);
    }
  };

  const addImage = () => {
    if (imageInput.trim() && !images.includes(imageInput.trim())) {
      setImages([...images, imageInput.trim()]);
      setImageInput("");
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    // Add images to FormData
    images.forEach((image) => {
      formData.append("images", image);
    });

    const result = isEdit
      ? await updateProduct(product.id, formData)
      : await createProduct(formData);

    setLoading(false);

    if (result.success) {
      toast.success(`Product ${isEdit ? "updated" : "created"} successfully`);
      router.push("/admin/products");
      router.refresh();
    } else {
      toast.error(
        result.error || `Failed to ${isEdit ? "update" : "create"} product`
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Basic Information</h3>

        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name">
            Product Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            name="name"
            type="text"
            defaultValue={product?.name}
            onChange={handleNameChange}
            required
            placeholder="e.g., Wireless Bluetooth Headphones"
          />
        </div>

        {/* Slug */}
        <div className="space-y-2">
          <Label htmlFor="slug">
            URL Slug <span className="text-destructive">*</span>
          </Label>
          <Input
            id="slug"
            name="slug"
            type="text"
            defaultValue={product?.slug}
            required
            placeholder="e.g., wireless-bluetooth-headphones"
          />
          <p className="text-xs text-muted-foreground">
            This will be used in the product URL
          </p>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            defaultValue={product?.description || ""}
            rows={4}
            placeholder="Describe your product..."
          />
        </div>
      </div>

      {/* Pricing and Inventory */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Pricing and Inventory</h3>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Price */}
          <div className="space-y-2">
            <Label htmlFor="price">
              Price (GHS) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="price"
              name="price"
              type="number"
              step="0.01"
              min="0"
              defaultValue={product?.price}
              required
              placeholder="0.00"
            />
          </div>

          {/* Stock Quantity */}
          <div className="space-y-2">
            <Label htmlFor="stockQuantity">
              Stock Quantity <span className="text-destructive">*</span>
            </Label>
            <Input
              id="stockQuantity"
              name="stockQuantity"
              type="number"
              min="0"
              defaultValue={product?.stockQuantity}
              required
              placeholder="0"
            />
          </div>
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label htmlFor="categoryId">Category</Label>
          <select
            id="categoryId"
            name="categoryId"
            defaultValue={product?.categoryId || ""}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">Uncategorized</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Images */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Product Images</h3>

        {/* Add Image Input */}
        <div className="flex gap-2">
          <Input
            type="url"
            value={imageInput}
            onChange={(e) => setImageInput(e.target.value)}
            placeholder="Enter image URL"
          />
          <Button
            type="button"
            variant="outline"
            onClick={addImage}
            disabled={!imageInput.trim()}
          >
            <Plus className="size-4" />
            <span className="ml-2">Add</span>
          </Button>
        </div>

        {/* Images List */}
        {images.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {images.map((image, index) => (
              <div
                key={index}
                className="relative group rounded-lg border overflow-hidden"
              >
                <img
                  src={image}
                  alt={`Product image ${index + 1}`}
                  className="aspect-square w-full object-cover"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 size-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeImage(index)}
                >
                  <X className="size-4" />
                </Button>
                {index === 0 && (
                  <div className="absolute bottom-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                    Main Image
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          Add product images by entering their URLs. The first image will be
          used as the main product image.
        </p>
      </div>

      {/* Submit Buttons */}
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="size-4 animate-spin" />}
          <span className={loading ? "ml-2" : ""}>
            {isEdit ? "Update Product" : "Create Product"}
          </span>
        </Button>
      </div>
    </form>
  );
}
