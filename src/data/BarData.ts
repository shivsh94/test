export type BeverageItem = {
    id: number;
    name: string;
    price: number;
    description: string;
    image?: string;
    isVeg: boolean;
    tag?: string;
    alcohol_percentage?: string;
    quantity?: string;
    brand?: string;
    origin?: string;
    serving_size?: string;
  };
  
  export type Category = {
    id: number;
    name: string;
    image: string;
    items: BeverageItem[];
  };
  export const data: { categories: Category[] } = {
    "categories": [
      {
        "id": 1,
        "name": "Beer",
        "image": "/Beer.jpg",
        "items": [
          {
            "id": 101,
            "name": "Kingfisher Premium",
            "price": 299.0,
            "description": "India's most trusted beer brand. A refreshing lager with a crisp, clean taste and subtle hop aroma. Best served chilled for maximum enjoyment.",
            "image": "/beer.jpg",
            "isVeg": true,
            "tag": "Premium",
            "alcohol_percentage": "4.8%",
            "quantity": "650ml",
            "brand": "Kingfisher",
            "origin": "India",
            "serving_size": "1 Pint"
          },
          {
            "id": 102,
            "name": "Heineken",
            "price": 349.0,
            "description": "Premium Dutch lager beer with a mild bitter taste, fresh fruity aroma, and a bright golden color. Made with pure malt and unique A-yeast.",
            "image": "/beer.jpg",
            "isVeg": true,
            "tag": "Imported",
            "alcohol_percentage": "5%",
            "quantity": "500ml",
            "brand": "Heineken",
            "origin": "Netherlands",
            "serving_size": "1 Can"
          },
          {
            "id": 103,
            "name": "Corona Extra",
            "price": 399.0,
            "description": "A pale lager produced by Mexican brewery Cervecería Modelo. Known for its refreshing, smooth taste perfect for hot summer days.",
            "image": "/beer.jpg",
            "isVeg": true,
            "tag": "Premium Import",
            "alcohol_percentage": "4.5%",
            "quantity": "355ml",
            "brand": "Corona",
            "origin": "Mexico",
            "serving_size": "1 Bottle"
          }
        ]
      },
      {
        id: 2,
        name: "Vodka",
        image: "/Vodka.jpg",
        items: [
          {
            id: 401,
            name: "Absolut Vodka",
            price: 1799.0,
            description: "Classic Swedish vodka made with natural ingredients and no added sugar. Smooth and versatile.",
            image: "/Vodka.jpg",
            isVeg: true,
            alcohol_percentage: "40%",
            quantity: "750ml",
            brand: "Absolut",
            origin: "Sweden",
            serving_size: "30ml Peg"
          },
          {
            id: 402,
            name: "Smirnoff No. 21",
            price: 1299.0,
            description: "The world's number one vodka brand. Triple distilled for purity and ten times filtered for smoothness.",
            image: "/Vodka.jpg",
            isVeg: true,
            alcohol_percentage: "40%",
            quantity: "750ml",
            brand: "Smirnoff",
            origin: "Russia",
            serving_size: "30ml Peg"
          }
        ]
      },
      {
        "id": 3,
        "name": "Wine",
        "image": "/wine.jpg",
        "items": [
          {
            "id": 301,
            "name": "Sula Vineyards Cabernet Shiraz",
            "price": 899.0,
            "description": "A beautiful red wine blend with rich flavors of black currant and berries. Full-bodied with smooth tannins and a long finish.",
            "image": "/wine.jpg",
            "isVeg": true,
            "tag": "Premium Wine",
            "alcohol_percentage": "13.5%",
            "quantity": "750ml",
            "brand": "Sula Vineyards",
            "origin": "India",
            "serving_size": "150ml Glass"
          },
          {
            "id": 302,
            "name": "Jacob's Creek Chardonnay",
            "price": 1299.0,
            "description": "Australian white wine with fresh citrus notes and a crisp finish. Perfect with seafood and light pasta dishes.",
            "image": "/wine.jpg",
            "isVeg": true,
            "tag": "Imported",
            "alcohol_percentage": "12.8%",
            "quantity": "750ml",
            "brand": "Jacob's Creek",
            "origin": "Australia",
            "serving_size": "150ml Glass"
          }
        ]
      },
      {
        "id": 4,
        "name": "Whiskey",
        "image": "/whiskey.jpg",
        "items": [
          {
            "id": 401,
            "name": "Glenfiddich 12 Year Old",
            "price": 4999.0,
            "description": "Single malt Scotch whisky aged for 12 years. Distinctively fresh and fruity with a hint of pear. Beautifully crafted and delicately balanced.",
            "image": "/whiskey.jpg",
            "isVeg": true,
            "tag": "Single Malt",
            "alcohol_percentage": "40%",
            "quantity": "750ml",
            "brand": "Glenfiddich", 
            "origin": "Scotland",
            "serving_size": "30ml Peg"
          },
          {
            "id": 402,
            "name": "Johnnie Walker Black Label",
            "price": 3999.0,
            "description": "A premium blended Scotch whisky with a smooth, smoky taste and a blend of over 40 whiskies.",
            "image": "/whiskey.jpg",
            "isVeg": true,
            "tag": "Blended",
            "alcohol_percentage": "40%",
            "quantity": "750ml",
            "brand": "Johnnie Walker",
            "origin": "Scotland",
            "serving_size": "30ml Peg"
          },
          {
            "id": 403,
            "name": "Jameson Irish Whiskey",
            "price": 2999.0,
            "description": "A smooth Irish whiskey with a perfect balance of spicy, nutty, and vanilla flavors.",
            "image": "/whiskey.jpg",
            "isVeg": true,
            "tag": "Irish Whiskey",
            "alcohol_percentage": "40%",
            "quantity": "750ml",
            "brand": "Jameson",
            "origin": "Ireland",
            "serving_size": "30ml Peg"
          }
        ]
      },
      {
        id: 5,
        name: "Martini",
        image: "/martini.jpg",
        items: [
          {
            id: 501,
            name: "Jose Cuervo Especial",
            price: 1999.0,
            description: "A golden tequila with a rich blend of agave and oak flavors. Perfect for sipping or mixing.",
            image: "/martini.jpg",
            isVeg: true,
            alcohol_percentage: "40%",
            quantity: "750ml",
            brand: "Jose Cuervo",
            origin: "Mexico",
            serving_size: "30ml Peg"
          },
          {
            id: 502,
            name: "Patrón Silver",
            price: 3999.0,
            description: "A premium tequila with a smooth, fresh taste and hints of citrus. Perfect for top-shelf margaritas.",
            image: "/martini.jpg",
            isVeg: true,
            alcohol_percentage: "40%",
            quantity: "750ml",
            brand: "Patrón",
            origin: "Mexico",
            serving_size: "30ml Peg"
          }
        ]
      },
      {
        id: 6,
        name: "Rum",
        image: "/rum.jpg",
        items: [
          {
            id: 601,
            name: "Old Monk Rum",
            price: 699.0,
            description: "India's legendary dark rum with a smooth caramel flavor and a hint of vanilla.",
            image: "/rum.jpg",
            isVeg: true,
            alcohol_percentage: "42.8%",
            quantity: "750ml",
            brand: "Old Monk",
            origin: "India",
            serving_size: "30ml Peg"
          },
          {
            id: 602,
            name: "Captain Morgan Original Spiced Rum",
            price: 999.0,
            description: "A classic spiced rum with hints of vanilla and caramel. Perfect for cocktails.",
            image: "/rum.jpg",
            isVeg: true,
            alcohol_percentage: "35%",
            quantity: "750ml",
            brand: "Captain Morgan",
            origin: "Jamaica",
            serving_size: "30ml Peg"
          }
        ]
      }
    ]
  };