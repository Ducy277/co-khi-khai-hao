"use client";

import Link from "next/link";
import { useCallback, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Filter, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

type FilterAttribute = {
  id: number;
  name: string;
  slug: string;
  type: string;
  options: {
    id: number;
    value: string;
  }[];
};

type FilterCategory = {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
};

type SearchParamsLike = Record<string, string | string[] | undefined>;

type ProductFilterSidebarProps = {
  basePath: string;
  searchParams: SearchParamsLike;
  attributes: FilterAttribute[];
  categories: FilterCategory[];
  currentCategoryId?: number;
  currentParentCategoryId?: number | null;
};

function toSingle(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] || "";
  return value || "";
}

function toMany(value: string | string[] | undefined): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  return value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

export default function ProductFilterSidebar({
  basePath,
  searchParams,
  attributes,
  categories,
  currentCategoryId,
  currentParentCategoryId,
}: ProductFilterSidebarProps) {
  const router = useRouter();
  const [expandedCats, setExpandedCats] = useState<Set<number>>(new Set([
    ...(currentParentCategoryId ? [currentParentCategoryId] : []),
    ...(currentCategoryId ? [currentCategoryId] : [])
  ]));
  const formRef = useRef<HTMLFormElement>(null);
  const debounceRef = useRef<number | null>(null);
  const [optionSearch, setOptionSearch] = useState<Record<string, string>>({});

  const q = toSingle(searchParams.q);

  const topCategories = useMemo(
    () => categories.filter((category) => !category.parentId),
    [categories],
  );

  const childMap = useMemo(() => {
    const map = new Map<number, FilterCategory[]>();
    for (const category of categories) {
      if (!category.parentId) continue;
      const list = map.get(category.parentId) || [];
      list.push(category);
      map.set(category.parentId, list);
    }
    return map;
  }, [categories]);

  const clearDebounce = () => {
    if (debounceRef.current !== null) {
      window.clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
  };

  const applyFromForm = useCallback(
    (debounced = false) => {
      const run = () => {
        if (!formRef.current) return;

        const fd = new FormData(formRef.current);
        const nextParams = new URLSearchParams();

        for (const [key, raw] of fd.entries()) {
          const value = String(raw).trim();
          if (!value) continue;
          if (key === "page") continue;
          nextParams.append(key, value);
        }

        nextParams.set("page", "1");
        const query = nextParams.toString();
        const href = query ? `${basePath}?${query}` : basePath;
        router.replace(href, { scroll: false });
      };

      clearDebounce();
      if (debounced) {
        debounceRef.current = window.setTimeout(run, 350);
        return;
      }

      run();
    },
    [basePath, router],
  );

  return (
    <form
      ref={formRef}
      className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 sticky top-24 h-[calc(100vh-7.25rem)] max-h-[760px] flex flex-col"
      method="GET"
      onSubmit={(event) => event.preventDefault()}
    >
      <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
        <Filter className="w-5 h-5 text-blue-600" />
        <h2 className="font-bold text-slate-800 text-lg">Bộ lọc</h2>
      </div>

      <div className="mt-4 space-y-5 overflow-y-auto pr-1">
        <div>
          <h3 className="text-sm font-semibold text-slate-800 mb-2">Từ khóa</h3>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Tên sản phẩm, SKU..."
              className="w-full rounded-md border border-slate-300 pl-9 pr-3 py-2 text-sm"
              onInput={() => applyFromForm(true)}
            />
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-800 mb-2">Danh mục</h3>
          <ul className="space-y-1 max-h-56 overflow-y-auto">
            <li>
              <Link
                href="/san-pham"
                className={`block px-3 py-2 rounded-lg font-medium text-sm transition-colors ${
                  !currentCategoryId
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-blue-600"
                }`}
              >
                Tất cả sản phẩm
              </Link>
            </li>

            {topCategories.map((category) => {
              const children = childMap.get(category.id) || [];
              const hasChildren = children.length > 0;
              const isExpanded = expandedCats.has(category.id);

              return (
                <li key={category.id}>
                  {hasChildren ? (
                    <button
                      type="button"
                      onClick={() => {
                        setExpandedCats(prev => {
                          const next = new Set(prev);
                          if (next.has(category.id)) next.delete(category.id);
                          else next.add(category.id);
                          return next;
                        });
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium text-sm transition-colors ${
                        category.id === currentCategoryId || isExpanded
                          ? "bg-blue-50 text-blue-700"
                          : "text-slate-600 hover:bg-slate-50 hover:text-blue-600"
                      }`}
                    >
                      <span>{category.name}</span>
                      <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                    </button>
                  ) : (
                    <Link
                      href={`/san-pham/${category.slug}`}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg font-medium text-sm transition-colors ${
                        category.id === currentCategoryId
                          ? "bg-blue-50 text-blue-700"
                          : "text-slate-600 hover:bg-slate-50 hover:text-blue-600"
                      }`}
                    >
                      <span>{category.name}</span>
                    </Link>
                  )}

                  {isExpanded && hasChildren ? (
                    <ul className="pl-4 mt-1 space-y-1 border-l-2 border-slate-100 ml-4 animate-in slide-in-from-top-2 fade-in duration-200">
                      {children.map((child) => (
                        <li key={child.id}>
                          <Link
                            href={`/san-pham/${child.slug}`}
                            className={`block px-3 py-1.5 rounded-md text-sm transition-colors ${
                              child.id === currentCategoryId
                                ? "text-blue-600 font-semibold"
                                : "text-slate-500 hover:text-blue-600"
                            }`}
                          >
                            {child.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </div>

        {attributes.map((attribute) => {
          const key = `attr_${attribute.slug}`;

          if (attribute.type === "select") {
            const selected = new Set(toMany(searchParams[key]));
            const keyword = optionSearch[key] || "";

            const filteredOptions = attribute.options.filter((option) =>
              option.value.toLowerCase().includes(keyword.toLowerCase()),
            );

            return (
              <div key={attribute.id} className="border border-slate-100 rounded-lg p-3">
                <h3 className="text-sm font-semibold text-slate-800 mb-2">{attribute.name}</h3>

                <div className="relative mb-2">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={keyword}
                    onChange={(event) =>
                      setOptionSearch((prev) => ({
                        ...prev,
                        [key]: event.target.value,
                      }))
                    }
                    placeholder="Tìm trong bộ lọc này..."
                    className="w-full rounded-md border border-slate-300 pl-8 pr-2 py-1.5 text-xs"
                  />
                </div>

                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {filteredOptions.map((option) => (
                    <label
                      key={option.id}
                      className="flex items-center gap-2 text-sm text-slate-700"
                    >
                      <input
                        type="checkbox"
                        name={key}
                        value={option.value}
                        defaultChecked={selected.has(option.value)}
                        className="h-4 w-4 rounded border-slate-300"
                        onChange={() => applyFromForm(false)}
                      />
                      <span>{option.value}</span>
                    </label>
                  ))}

                  {filteredOptions.length === 0 ? (
                    <p className="text-xs text-slate-500 py-1">Không có lựa chọn phù hợp.</p>
                  ) : null}
                </div>
              </div>
            );
          }

          if (attribute.type === "number") {
            return (
              <div key={attribute.id} className="border border-slate-100 rounded-lg p-3">
                <h3 className="text-sm font-semibold text-slate-800 mb-2">{attribute.name}</h3>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    step="any"
                    name={`${key}_min`}
                    defaultValue={toSingle(searchParams[`${key}_min`])}
                    placeholder="Từ"
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                    onInput={() => applyFromForm(true)}
                  />
                  <input
                    type="number"
                    step="any"
                    name={`${key}_max`}
                    defaultValue={toSingle(searchParams[`${key}_max`])}
                    placeholder="Đến"
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                    onInput={() => applyFromForm(true)}
                  />
                </div>
              </div>
            );
          }

          return null;
        })}
      </div>

      <input type="hidden" name="page" value="1" />

      <div className="pt-4 mt-4 border-t border-slate-100">
        <Link href={basePath} className="block">
          <Button type="button" variant="outline" className="w-full">
            Xóa lọc
          </Button>
        </Link>
      </div>
    </form>
  );
}
