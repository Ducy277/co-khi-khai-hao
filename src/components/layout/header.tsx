import prisma from "@/lib/prisma";
import HeaderClient from "@/components/layout/header-client";

export default async function Header() {
  const categories = await prisma.category.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      parentId: true,
    },
    orderBy: [{ parentId: "asc" }, { sortOrder: "asc" }],
  });

  return <HeaderClient categories={categories} />;
}
