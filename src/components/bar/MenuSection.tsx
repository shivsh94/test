"use client";
import type { MenuSectionProps } from "@/components/common/foodBar/MenuSection";

import { MenuSection as BaseMenuSection } from "../common/foodBar/MenuSection";

export function MenuSection(props: Readonly<MenuSectionProps>) {
  return <BaseMenuSection {...props} showFoodType={false} />;
}
