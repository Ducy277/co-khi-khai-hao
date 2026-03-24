"use client";

import { useEffect, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Product, Category, Brand, CategoryAttribute, AttributeOption, ProductImage, ProductAttributeValue } from "@prisma/client";
import { useRouter } from "next/navigation";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { createProduct, updateProduct } from "../actions";
import ImageUpload from "./image-upload";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

type AttributeFull = CategoryAttribute & { options: AttributeOption[] };
type ProductFull = Product & {
  images: ProductImage[];
  attributeValues: ProductAttributeValue[];
};

const formSchema = z.object({
  name: z.string().min(1, "Vui lòng nhập tên sản phẩm"),
  slug: z.string().min(1, "Slug không được trống"),
  sku: z.string().min(1, "Mã SKU không được trống"),
  description: z.string().optional(),
  price: z.coerce.number().optional().nullable(),
  priceOnRequest: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  seoTitle: z.string().optional(),
  seoDesc: z.string().optional(),
  categoryId: z.string().min(1, "Vui lòng chọn danh mục"),
  brandId: z.string().optional(),
  images: z.array(z.object({
    url: z.string(),
    alt: z.string().optional().nullable(),
    isPrimary: z.boolean().default(false),
    sortOrder: z.number().default(0)
  })).default([]),
  attributes: z.record(z.string(), z.string()).optional()
});

interface ProductFormProps {
  initialData?: ProductFull | null;
  categories: Category[];
  brands: Brand[];
  attributes: AttributeFull[];
}

function generateSlug(str: string) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .replace(/([^0-9a-z-\s])/g, "")
    .replace(/(\s+)/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function ProductForm({ initialData, categories, brands, attributes }: ProductFormProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const isEditing = !!initialData;

  // Format initial attributes values to Record
  const initialAttributesFormatted: Record<string, string> = {};
  if (initialData?.attributeValues) {
    initialData.attributeValues.forEach(av => {
      initialAttributesFormatted[av.attributeId.toString()] = av.value;
    });
  }

  type ProductFormInput = z.input<typeof formSchema>;
  type ProductFormOutput = z.output<typeof formSchema>;

  const form = useForm<ProductFormInput, unknown, ProductFormOutput>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      slug: initialData?.slug || "",
      sku: initialData?.sku || "",
      description: initialData?.description || "",
      price: initialData?.price ? Number(initialData.price) : 0,
      priceOnRequest: initialData?.priceOnRequest || false,
      isFeatured: initialData?.isFeatured || false,
      isActive: initialData?.isActive ?? true,
      seoTitle: initialData?.seoTitle || "",
      seoDesc: initialData?.seoDesc || "",
      categoryId: initialData?.categoryId.toString() || "",
      brandId: initialData?.brandId?.toString() || "none",
      images: initialData?.images?.map(img => ({
        url: img.url,
        alt: img.alt,
        isPrimary: img.isPrimary,
        sortOrder: img.sortOrder
      })) || [],
      attributes: initialAttributesFormatted
    },
  });

  const watchName = form.watch("name");
  const watchCategoryId = form.watch("categoryId");
  const watchPriceOnRequest = form.watch("priceOnRequest");

  // Auto-generate slug
  useEffect(() => {
    if (!isEditing && watchName) {
      form.setValue("slug", generateSlug(watchName), { shouldValidate: true });
    }
  }, [watchName, isEditing, form]);

  // Determine which attributes apply to the currently selected category
  const activeAttributes = useMemo(() => {
    if (!watchCategoryId) return attributes.filter(a => a.isGlobal);
    const catId = Number(watchCategoryId);
    return attributes.filter(a => a.isGlobal || a.categoryId === catId);
  }, [watchCategoryId, attributes]);

  const onSubmit = async (values: ProductFormOutput) => {
    setIsPending(true);

    const payload = {
      ...values,
      categoryId: Number(values.categoryId),
      brandId: values.brandId === "none" || !values.brandId ? null : Number(values.brandId),
      price: values.priceOnRequest ? null : values.price,
      // Remove empty attributes
      attributes: Object.fromEntries(
        Object.entries(values.attributes || {}).filter(([_, v]) => v !== "" && v !== undefined)
      )
    };

    let result;
    if (isEditing) {
      result = await updateProduct({ ...payload, id: initialData.id });
    } else {
      result = await createProduct(payload);
    }

    setIsPending(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(isEditing ? "Cập nhật sản phẩm thành công!" : "Thêm mới sản phẩm thành công!");
      router.push("/admin/san-pham");
      router.refresh();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        
        {/* THÔNG TIN CƠ BẢN */}
        <Card>
          <CardHeader>
            <CardTitle>Thông tin cơ bản</CardTitle>
            <CardDescription>Tên gọi, phân loại và các mã định danh của sản phẩm.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Tên sản phẩm *</FormLabel>
                  <FormControl>
                    <Input placeholder="VD: Ổ bi cầu SKF 6205" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Đường dẫn (Slug) *</FormLabel>
                  <FormControl>
                    <Input placeholder="o-bi-cau-skf-6205" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sku"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mã sản phẩm (SKU) *</FormLabel>
                  <FormControl>
                    <Input placeholder="VD: SKF-6205" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Danh mục *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="-- Chọn danh mục --" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id.toString()}>
                          {c.parentId ? `└─ ${c.name}` : c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="brandId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Thương hiệu</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="-- Chọn thương hiệu --" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">-- Không xác định --</SelectItem>
                      {brands.map((b) => (
                        <SelectItem key={b.id} value={b.id.toString()}>
                          {b.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Mô tả chi tiết</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Viết mô tả cho sản phẩm này..." className="h-32" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* GIÁ CẢ & TRẠNG THÁI */}
        <Card>
          <CardHeader>
            <CardTitle>Giá cả & Hiển thị</CardTitle>
            <CardDescription>Thiết lập giá bán và trạng thái trên website.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="priceOnRequest"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm md:col-span-2">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Trạng thái Báo Giá (Liên hệ)</FormLabel>
                    <FormDescription>
                      Bật cấu hình này nếu bạn không muốn hiện giá công khai, mà yêu cầu khách thêm vào giỏ Báo Giá.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {!watchPriceOnRequest && (
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Giá bán (VND)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="VD: 150000"
                        value={typeof field.value === "number" ? field.value : ""}
                        onChange={(e) => {
                          const raw = e.target.value;
                          field.onChange(raw === "" ? null : Number(raw));
                        }}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Cho phép hiển thị</FormLabel>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isFeatured"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Sản phẩm Nổi Bật</FormLabel>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* HÌNH ẢNH */}
        <Card>
          <CardHeader>
            <CardTitle>Hình ảnh Sản phẩm</CardTitle>
            <CardDescription>Upload hình ảnh minh hoạ. Ảnh đầu tiên (Cover) sẽ làm ảnh đại diện chính.</CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="images"
              render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <ImageUpload
                        value={(field.value || []).map((img, index) => ({
                          url: img.url,
                          alt: img.alt || "",
                          isPrimary: img.isPrimary ?? index === 0,
                          sortOrder: img.sortOrder ?? index,
                        }))}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
          </CardContent>
        </Card>

        {/* THÔNG SỐ KỸ THUẬT (ĐỘNG - EAV) */}
        {activeAttributes.length > 0 && (
          <Card className="border-blue-100 shadow-sm">
            <CardHeader className="bg-blue-50/50">
              <CardTitle className="text-blue-800">Thông số Kỹ Thuật (Động)</CardTitle>
              <CardDescription>
                Bộ thuộc tính tự động trích xuất dựa trên Danh mục bạn vừa chọn.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
              {activeAttributes.map((attr) => (
                <FormField
                  key={attr.id}
                  control={form.control}
                  name={`attributes.${attr.id}`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex justify-between">
                        <span>{attr.name} {attr.isRequired && <span className="text-red-500">*</span>}</span>
                        {attr.isGlobal && <span className="text-[10px] text-slate-400 font-normal uppercase">Toàn cục</span>}
                      </FormLabel>
                      <FormControl>
                        {attr.type === "select" ? (
                          <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={`-- Chọn ${attr.name.toLowerCase()} --`} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="none" className="text-slate-400">--- Bỏ chọn ---</SelectItem>
                              {attr.options.map(opt => (
                                <SelectItem key={opt.id} value={opt.value}>{opt.value}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : attr.type === "number" ? (
                          <div className="flex items-center space-x-2">
                           <Input type="number" step="any" placeholder="VD: 50.5" {...field} value={field.value || ""} />
                           {attr.unit && <span className="text-sm text-slate-500 whitespace-nowrap">{attr.unit}</span>}
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                           <Input type="text" placeholder={`Nhập ${attr.name.toLowerCase()}...`} {...field} value={field.value || ""} />
                           {attr.unit && <span className="text-sm text-slate-500 whitespace-nowrap">{attr.unit}</span>}
                          </div>
                        )}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </CardContent>
          </Card>
        )}

        {/* SEO META */}
        <Card>
          <CardHeader>
            <CardTitle>SEO Meta (Tuỳ chọn)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="seoTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meta Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Tiêu đề hiển thị trên Google..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="seoDesc"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meta Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Mô tả tóm tắt hiển thị trên kết quả tìm kiếm..." className="h-20" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* FOOTER ACTIONS */}
        <div className="flex items-center justify-end space-x-4 sticky bottom-4 bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-slate-200 shadow-sm z-10">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={isPending}>
            Hủy bỏ
          </Button>
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700 w-40" disabled={isPending}>
            {isPending ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Đang lưu...</>
            ) : isEditing ? (
              "Lưu thay đổi"
            ) : (
              "Tạo sản phẩm mới"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
