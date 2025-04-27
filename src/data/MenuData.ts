// This should go in your MenuData.ts file
export interface MenuItem {
  available: boolean;
  context?: { 
    days: Record<string, boolean>; // or string[] if you prefer
    timings?: Array<{
      start_time: string;
      end_time: string;
    }>;
  };
  id: string;
  name: string;
  price: string | number;
  description: string;
  photo?: string;
  food_type: string;
  labels?: string | string[];
  tag?: string;
  isVeg?: boolean;
  customisable?: boolean;
  is_multiple?: boolean;
  sub_items?: MenuItem[];
}
export interface MenuData {
  [key: string]: MenuItem[];
}

// export const menuData: MenuData = {
//   MainCourse: [
//     { id: 1, name: "Dal Tadka", price: 150, description: "Creamy lentils tempered with ghee, spices, and aromatic herbs.", image: "/Shahi-Paneer.jpg", tag: "", isVeg: true, customisable: false },
//     { id: 2, name: "Matter Mushroom", price: 200, description: "Good one", image: "/Shahi-Paneer.jpg", tag: "", isVeg: true, customisable: true },
//     { id: 3, name: "Shahi Paneer", price: 250, description: "Tasty delicious", image: "/Shahi-Paneer.jpg", tag: "Must Try", isVeg: true, customisable: false }
//   ],
//   Drinks: [
//     { id: 4, name: "Mango Smoothie", price: 120, description: "Refreshing and sweet", image: "/Black_Coffee.jpg", tag: "Summer Special", isVeg: true, customisable: true },
//     { id: 5, name: "Lemon Soda", price: 80, description: "Tangy and fizzy", image: "/Black_Coffee.jpg", tag: "All-time Favorite", isVeg: true, customisable: true },
//     { id: 6, name: "Fruit Punch", price: 150, description: "Blend of fresh fruits", image: "/Black_Coffee.jpg", tag: "Must Try", isVeg: true, customisable: true }
//   ],
//   HotDrinks: [
//     { id: 7, name: "Masala Tea", price: 50, description: "Spiced traditional tea", image: "/tea.jpg", tag: "Popular", isVeg: true, customisable: true },
//     { id: 8, name: "Hot Chocolate", price: 100, description: "Rich and creamy", image: "/Black_Coffee.jpg", tag: "Perfect for Winter", isVeg: true, customisable: true },
//     { id: 9, name: "Filter Coffee", price: 60, description: "South Indian style", image: "/Black_Coffee.jpg", tag: "Classic", isVeg: true, customisable: false }
//   ],
//   HealthBooster: [
//     { id: 10, name: "Green Smoothie", price: 200, description: "Packed with spinach and kale", image: "/tea.jpg", tag: "Healthy Choice", isVeg: true, customisable: true },
//     { id: 11, name: "Beetroot Juice", price: 150, description: "Rich in nutrients", image: "/tea.jpg", tag: "", isVeg: true, customisable: true },
//     { id: 12, name: "Protein Shake", price: 250, description: "Boost your energy", image: "/tea.jpg", tag: "Gym Favorite", isVeg: true, customisable: false }
//   ],
//   EggCellentDishes: [
//     { id: 13, name: "Egg Bhurji", price: 120, description: "Scrambled eggs with Indian spices", image: "/egg.jpg", tag: "", isVeg: true, customisable: true },
//     { id: 14, name: "Masala Omelette", price: 150, description: "", image: "/egg.jpg", tag: "Protein Rich", isVeg: true, customisable: false },
//     { id: 15, name: "Egg Curry", price: 180, description: "Boiled eggs in spicy gravy", image: "/egg.jpg", tag: "", isVeg: true, customisable: true }
//   ],
//   SandwichesAndBurgers: [
//     { id: 16, name: "Veg Sandwich", price: 80, description: "Fresh veggies with cheese", image: "/tea.jpg", tag: "", isVeg: true, customisable: true },
//     { id: 17, name: "Cheese Burger", price: 150, description: "Juicy patty with melted cheese", image: "/tea.jpg", tag: "Must Try", isVeg: true, customisable: true },
//     { id: 18, name: "Club Sandwich", price: 120, description: "Multi-layered delight", image: "/tea.jpg", tag: "", isVeg: false, customisable: false }
//   ],
//   AllDryLong: [
//     { id: 19, name: "Chicken Tikka", price: 300, description: "Spiced chicken grilled to perfection and precision with grilled vegetables", image: "/tea.jpg", tag: "Must Try", isVeg: false, customisable: true },
//     { id: 20, name: "Paneer Tikka", price: 250, description: "Cottage cheese grilled with spices", image: "/tea.jpg", tag: "", isVeg: true, customisable: true },
//     { id: 21, name: "Veg Seekh Kebab", price: 200, description: "Vegetarian skewers with rich spices", image: "/tea.jpg", tag: "Healthy", isVeg: true, customisable: true }
//   ],
//   FlavorOfIndia: [
//     { id: 22, name: "Butter Chicken", price: 350, description: "Creamy tomato gravy with chicken", image: "/tea.jpg", tag: "Classic", isVeg: false, customisable: true },
//     { id: 23, name: "Palak Paneer", price: 250, description: "Spinach curry with cottage cheese", image: "/tea.jpg", tag: "", isVeg: true, customisable: true },
//     { id: 24, name: "Chole Bhature", price: 150, description: "Chickpeas with fried bread", image: "/tea.jpg", tag: "Popular", isVeg: true, customisable: true }
//   ],
//   RiceDishes: [
//     { id: 25, name: "Veg Biryani", price: 200, description: "Aromatic rice with vegetables", image: "/tea.jpg", tag: "Chef's Special", isVeg: true, customisable: true },
//     { id: 26, name: "Chicken Fried Rice", price: 180, description: "Stir-fried rice with chicken", image: "/tea.jpg", tag: "", isVeg: false, customisable: true },
//     { id: 27, name: "Jeera Rice", price: 100, description: "Simple and flavorful", image: "/tea.jpg", tag: "", isVeg: true, customisable: true }
//   ],
//   IndianBreads: [
//     { id: 28, name: "Butter Naan", price: 50, description: "Soft flatbread with butter", image: "/tea.jpg", tag: "", isVeg: true, customisable: true },
//     { id: 29, name: "Garlic Naan", price: 60, description: "Flatbread with garlic seasoning", image: "/tea.jpg", tag: "Popular", isVeg: true, customisable: true },
//     { id: 30, name: "Tandoori Roti", price: 40, description: "Traditional Indian bread", image: "/tea.jpg", tag: "", isVeg: true, customisable: true }
//   ],
//   Salads: [
//     { id: 31, name: "Green Salad", price: 70, description: "Fresh and crisp vegetables", image: "/tea.jpg", tag: "Healthy Choice", isVeg: true, customisable: true },
//     { id: 32, name: "Greek Salad", price: 120, description: "Feta cheese with olives", image: "/tea.jpg", tag: "", isVeg: true, customisable: true },
//     { id: 33, name: "Caesar Salad", price: 150, description: "Classic salad with croutons", image: "/tea.jpg", tag: "Must Try", isVeg: true, customisable: true }
//   ],
//   Desserts: [
//     { id: 34, name: "Gulab Jamun", price: 50, description: "Sweet milk dumplings", image: "/tea.jpg", tag: "Popular", isVeg: true, customisable: true },
//     { id: 35, name: "Rasmalai", price: 100, description: "Cottage cheese in saffron milk", image: "/tea.jpg", tag: "", isVeg: true, customisable: true },
//     { id: 36, name: "Chocolate Brownie", price: 150, description: "Rich chocolate dessert", image: "/tea.jpg", tag: "All-time Favorite", isVeg: true, customisable: true }
//   ],
//   Starters: [
//     { id: 37, name: "Paneer Tikka", price: 250, description: "Grilled paneer with spices", image: "/tea.jpg", tag: "", isVeg: true, customisable: true  },
//     { id: 38, name: "Chicken Wings", price: 300, description: "Spicy and tangy wings", image: "/tea.jpg", tag: "", isVeg: false, customisable: true  },
//     { id: 39, name: "Spring Rolls", price: 150, description: "Crispy rolls with vegetables", image: "/tea.jpg", tag: "Crispy", isVeg: true, customisable: true  }
//   ],
    
//     ColdDrinks: [
//       { id: 40, name: "Coke", price: 50, description: "Chilled and refreshing", image: "/tea.jpg", tag: "", isVeg: true, customisable: true  },
//       { id: 41, name: "Iced Tea", price: 70, description: "Perfect for summers", image: "/tea.jpg", tag: "Summer Special", isVeg: true, customisable: true  },
//       { id: 42, name: "Cold Coffee", price: 100, description: "Iced coffee delight", image: "/tea.jpg", tag: "", isVeg: true , customisable: true }
//     ],
    
//     IndianSpecialties: [
//       { id: 43, name: "Rajma Chawal", price: 150, description: "Kidney beans with rice", image: "/tea.jpg", tag: "", isVeg: true, customisable: true  },
//       { id: 44, name: "Pav Bhaji", price: 120, description: "Spicy vegetable mash with bread", image: "/tea.jpg", tag: "Classic", isVeg: true, customisable: true  },
//       { id: 45, name: "Dhokla", price: 100, description: "Soft and fluffy snack", image: "/tea.jpg", tag: "", isVeg: true , customisable: true }
//     ]    
//   };