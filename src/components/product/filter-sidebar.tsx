"use client";

import Link from "next/link";
import { useCallback, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  ChevronDown,
  Search,
  X,
  Filter,
  SlidersHorizontal,
} from "lucide-react";

type FilterOption = {
  id: number;
  value: string;
};

type FilterAttribute = {
  id: number;
  name: string;
  slug: string;
  type: string;
  options: FilterOption[];
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
  totalProducts?: number;
  availableValues?: Record<number, string[]>;
  onClose?: () => void;
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

// ─── Attribute Group ──────────────────────────────────────────────────────────
function AttributeGroup({
  attribute,
  paramKey,
  searchParams,
  availableSet,
  onApply,
}: {
  attribute: FilterAttribute;
  paramKey: string;
  searchParams: SearchParamsLike;
  availableSet: Set<string> | null;
  onApply: () => void;
}) {
  const selected = useMemo(
    () => new Set(toMany(searchParams[paramKey])),
    [searchParams, paramKey]
  );
  const hasSelected = selected.size > 0;

  const SEARCH_THRESHOLD = 8;
  const [isOpen, setIsOpen] = useState(
    hasSelected || attribute.options.length <= 10
  );
  const [keyword, setKeyword] = useState("");

  // Categorise options: selected / available / unavailable
  const categorizedOptions = useMemo(() => {
    return attribute.options.map((opt) => {
      const isSelected = selected.has(opt.value);
      const isAvailable =
        availableSet === null || availableSet.has(opt.value) || isSelected;
      return { ...opt, isSelected, isAvailable };
    });
  }, [attribute.options, selected, availableSet]);

  const selectedOptions = categorizedOptions.filter((o) => o.isSelected);
  const availableOptions = categorizedOptions.filter(
    (o) => !o.isSelected && o.isAvailable
  );
  const unavailableOptions = categorizedOptions.filter(
    (o) => !o.isSelected && !o.isAvailable
  );

  const filteredCategorized = useMemo(() => {
    if (!keyword) return categorizedOptions;
    const kw = keyword.toLowerCase();
    return categorizedOptions.filter((o) =>
      o.value.toLowerCase().includes(kw)
    );
  }, [categorizedOptions, keyword]);

  const showSearch = attribute.options.length >= SEARCH_THRESHOLD;

  const MAX_VISIBLE = 10;
  const [showAll, setShowAll] = useState(hasSelected);

  const displayList = useMemo(() => {
    if (keyword) return filteredCategorized;
    const ordered = [
      ...selectedOptions,
      ...availableOptions,
      ...unavailableOptions,
    ];
    if (showAll) return ordered;
    const unselectedToShow = Math.max(0, MAX_VISIBLE - selectedOptions.length);
    const shownAvailable = availableOptions.slice(0, unselectedToShow);
    const shownUnavailable =
      unselectedToShow > availableOptions.length
        ? unavailableOptions.slice(0, unselectedToShow - availableOptions.length)
        : [];
    return [...selectedOptions, ...shownAvailable, ...shownUnavailable];
  }, [
    keyword,
    filteredCategorized,
    selectedOptions,
    availableOptions,
    unavailableOptions,
    showAll,
  ]);

  const totalVisible = keyword
    ? filteredCategorized.length
    : selectedOptions.length + availableOptions.length + unavailableOptions.length;
  const hasMore = !keyword && totalVisible > MAX_VISIBLE;

  return (
    <div className="border border-slate-100 rounded-xl overflow-hidden">
      {/* Header */}
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-semibold text-slate-800 truncate">
            {attribute.name}
          </span>
          {hasSelected && (
            <span className="shrink-0 bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {selected.size}
            </span>
          )}
        </div>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Body */}
      {isOpen && (
        <div className="px-4 py-3">
          {/* Search box */}
          {showSearch && (
            <div className="relative mb-3">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Tìm..."
                className="w-full border border-slate-200 rounded-lg pl-8 pr-8 py-1.5 text-xs outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 bg-slate-50"
              />
              {keyword && (
                <button
                  type="button"
                  onClick={() => setKeyword("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          )}

          {/* Options */}
          <div className="space-y-0.5">
            {displayList.map((option) => (
              <label
                key={option.id}
                className={`flex items-center gap-2.5 py-1.5 px-2 rounded-lg cursor-pointer group transition-all duration-150 ${
                  option.isSelected
                    ? "bg-blue-50"
                    : option.isAvailable
                    ? "hover:bg-slate-50"
                    : "opacity-30 cursor-not-allowed"
                }`}
              >
                <input
                  type="checkbox"
                  name={paramKey}
                  value={option.value}
                  defaultChecked={option.isSelected}
                  disabled={!option.isAvailable && !option.isSelected}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 accent-blue-600 cursor-pointer disabled:cursor-not-allowed shrink-0"
                  onChange={
                    option.isAvailable || option.isSelected ? onApply : undefined
                  }
                />
                <span
                  className={`text-sm select-none flex-1 leading-snug ${
                    option.isSelected
                      ? "text-blue-700 font-medium"
                      : option.isAvailable
                      ? "text-slate-700 group-hover:text-slate-900"
                      : "text-slate-400"
                  }`}
                >
                  {option.value}
                </span>
              </label>
            ))}

            {displayList.length === 0 && (
              <p className="text-xs text-slate-400 py-2 text-center">
                Không tìm thấy.
              </p>
            )}
          </div>

          {/* Show more/less */}
          {hasMore && (
            <button
              type="button"
              onClick={() => setShowAll((v) => !v)}
              className="mt-2 text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 transition-colors"
            >
              {showAll ? (
                <>Thu gọn <ChevronDown className="w-3 h-3 rotate-180" /></>
              ) : (
                <>
                  Xem thêm{" "}
                  {totalVisible - displayList.length} lựa chọn{" "}
                  <ChevronDown className="w-3 h-3" />
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Sidebar ─────────────────────────────────────────────────────────────
export default function ProductFilterSidebar({
  basePath,
  searchParams,
  attributes,
  categories,
  currentCategoryId,
  currentParentCategoryId,
  totalProducts,
  availableValues,
  onClose,
}: ProductFilterSidebarProps) {
  const router = useRouter();
  const [expandedCats, setExpandedCats] = useState<Set<number>>(
    new Set([
      ...(currentParentCategoryId ? [currentParentCategoryId] : []),
      ...(currentCategoryId ? [currentCategoryId] : []),
    ])
  );
  const formRef = useRef<HTMLFormElement>(null);
  const debounceRef = useRef<number | null>(null);

  const q = toSingle(searchParams.q);

  const topCategories = useMemo(
    () => categories.filter((c) => !c.parentId),
    [categories]
  );

  const childMap = useMemo(() => {
    const map = new Map<number, FilterCategory[]>();
    for (const cat of categories) {
      if (!cat.parentId) continue;
      const list = map.get(cat.parentId) || [];
      list.push(cat);
      map.set(cat.parentId, list);
    }
    return map;
  }, [categories]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (q) count++;
    for (const attr of attributes) {
      const key = `attr_${attr.slug}`;
      if (toMany(searchParams[key]).length > 0) count++;
    }
    return count;
  }, [q, attributes, searchParams]);

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
          if (!value || key === "page") continue;
          nextParams.append(key, value);
        }
        nextParams.set("page", "1");
        const query = nextParams.toString();
        router.replace(query ? `${basePath}?${query}` : basePath, {
          scroll: false,
        });
      };

      clearDebounce();
      if (debounced) {
        debounceRef.current = window.setTimeout(run, 350);
        return;
      }
      run();
    },
    [basePath, router]
  );

  const handleClearFilters = () => {
    if (formRef.current) {
      formRef.current.querySelectorAll("input").forEach((input) => {
        if (input.type === "checkbox" || input.type === "radio") {
          input.checked = false;
        } else if (input.type !== "hidden") {
          input.value = "";
        }
      });
    }
    router.replace(basePath, { scroll: false });
  };

  return (
    <form
      ref={formRef}
      className="bg-white lg:rounded-xl lg:shadow-sm lg:border lg:border-slate-200 lg:p-4 p-5 lg:sticky lg:top-24 w-full h-full lg:h-[calc(100vh-7.25rem)] lg:max-h-[820px] flex flex-col flex-1 min-h-0"
      method="GET"
      onSubmit={(e) => e.preventDefault()}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-slate-500" />
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            Bộ lọc
          </h2>
          {activeFilterCount > 0 && (
            <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {activeFilterCount}
            </span>
          )}
        </div>
        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={handleClearFilters}
            className="text-xs text-slate-500 hover:text-red-500 flex items-center gap-1 transition-colors"
          >
            <X className="w-3 h-3" />
            Xóa tất cả
          </button>
        )}
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto space-y-4 min-h-0 pr-1">
        {/* Keyword search */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Tìm kiếm
          </label>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Tên sản phẩm, SKU..."
              className="w-full rounded-lg border border-slate-200 pl-9 pr-9 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 bg-slate-50"
              onInput={() => applyFromForm(true)}
            />
            {q && (
              <button
                type="button"
                onClick={() => {
                  if (formRef.current) {
                    const input =
                      formRef.current.querySelector<HTMLInputElement>(
                        'input[name="q"]'
                      );
                    if (input) input.value = "";
                  }
                  applyFromForm();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        <hr className="border-slate-100" />

        {/* Categories */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Danh mục
          </label>
          <ul className="space-y-0.5">
            <li>
              <Link
                href="/san-pham"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  !currentCategoryId
                    ? "bg-blue-50 text-blue-700 font-semibold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-blue-600"
                }`}
              >
                <Filter className="w-3.5 h-3.5 opacity-60" />
                Tất cả sản phẩm
              </Link>
            </li>

            {topCategories.map((cat) => {
              const children = childMap.get(cat.id) || [];
              const hasChildren = children.length > 0;
              const isExpanded = expandedCats.has(cat.id);
              const isActive =
                cat.id === currentCategoryId ||
                currentParentCategoryId === cat.id;

              return (
                <li key={cat.id}>
                  {hasChildren ? (
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedCats((prev) => {
                          const next = new Set(prev);
                          if (next.has(cat.id)) next.delete(cat.id);
                          else next.add(cat.id);
                          return next;
                        })
                      }
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-blue-50 text-blue-700 font-semibold"
                          : "text-slate-600 hover:bg-slate-50 hover:text-blue-600"
                      }`}
                    >
                      <span>{cat.name}</span>
                      <ChevronRight
                        className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                          isExpanded ? "rotate-90" : ""
                        }`}
                      />
                    </button>
                  ) : (
                    <Link
                      href={`/san-pham/${cat.slug}`}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-blue-50 text-blue-700 font-semibold"
                          : "text-slate-600 hover:bg-slate-50 hover:text-blue-600"
                      }`}
                    >
                      <span>{cat.name}</span>
                    </Link>
                  )}

                  {isExpanded && hasChildren && (
                    <ul className="pl-3 mt-0.5 space-y-0.5 border-l-2 border-blue-100 ml-4">
                      {children.map((child) => (
                        <li key={child.id}>
                          <Link
                            href={`/san-pham/${child.slug}`}
                            className={`block px-3 py-1.5 rounded-md text-sm transition-colors ${
                              child.id === currentCategoryId
                                ? "text-blue-600 font-semibold bg-blue-50"
                                : "text-slate-500 hover:text-blue-600 hover:bg-slate-50"
                            }`}
                          >
                            {child.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        {/* Attribute filters */}
        {attributes.length > 0 && (
          <>
            <hr className="border-slate-100" />
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Thông số kỹ thuật
              </label>
              <div className="space-y-2">
                {attributes.map((attr) => {
                  const key = `attr_${attr.slug}`;
                  if (attr.type === "select" || attr.type === "checkbox") {
                    const avArr = availableValues?.[attr.id];
                    const avSet: Set<string> | null =
                      avArr !== undefined ? new Set(avArr) : null;
                    return (
                      <AttributeGroup
                        key={attr.id}
                        attribute={attr}
                        paramKey={key}
                        searchParams={searchParams}
                        availableSet={avSet}
                        onApply={() => applyFromForm(false)}
                      />
                    );
                  }
                  if (attr.type === "number") {
                    return (
                      <div
                        key={attr.id}
                        className="border border-slate-100 rounded-xl overflow-hidden"
                      >
                        <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
                          <span className="text-sm font-semibold text-slate-800">
                            {attr.name}
                          </span>
                        </div>
                        <div className="px-4 py-3 grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] text-slate-500 font-medium uppercase mb-1 block">
                              Từ
                            </label>
                            <input
                              type="number"
                              step="any"
                              name={`${key}_min`}
                              defaultValue={toSingle(
                                searchParams[`${key}_min`]
                              )}
                              placeholder="0"
                              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
                              onInput={() => applyFromForm(true)}
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-500 font-medium uppercase mb-1 block">
                              Đến
                            </label>
                            <input
                              type="number"
                              step="any"
                              name={`${key}_max`}
                              defaultValue={toSingle(
                                searchParams[`${key}_max`]
                              )}
                              placeholder="∞"
                              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
                              onInput={() => applyFromForm(true)}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          </>
        )}
      </div>

      <input type="hidden" name="page" value="1" />

      {/* Footer — single "Xem X sản phẩm" button only */}
      {totalProducts !== undefined && (
        <div className="pt-4 mt-3 border-t border-slate-100 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors shadow-sm shadow-blue-500/20 lg:pointer-events-none"
          >
            Xem {totalProducts} sản phẩm
          </button>
        </div>
      )}
    </form>
  );
}
