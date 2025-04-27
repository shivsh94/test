"use client";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useCategoryStore } from "@/store/useProjectStore";


export default function CocktailsPage() {
  const { categories } = useCategoryStore();
  const router = useRouter();
  
  const categoryList = Array.isArray(categories) ? categories : [];
  const Barcategories = categoryList.filter(
    item => item.outlet === "Bar" 
  );

  return (
    <main className="container mx-auto p-4 mt-5">
      <h1 className="text-4xl font-bold text-center mb-8">Beverages</h1>
      
      <div className="grid grid-cols-2 gap-2">
        {Barcategories.map((category) => (
            <Card key={category.id} onClick={() => router.replace(`${window.location.href}/${category.id}`)}
              className="group relative overflow-hidden h-32 transition-all duration-200 hover:scale-[1.02]"
            >
              <div className="absolute inset-0">
                {/* <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-cover"
                /> */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/30 to-black/10" />
              </div>

              <CardHeader className="relative h-full flex flex-col justify-end text-white">
                <CardTitle className="text-2xl font-bold">{category.name}</CardTitle>
              </CardHeader>
            </Card>
          // </Link>
        ))}
      </div>
    </main>
  );
}