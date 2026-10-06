export const activities = [
  {
    "id": "restaurants",
    "engine": "food",
    "name": {
      "ar": "المطاعم والمقاهي",
      "en": "Restaurants & cafés",
      "fr": "Restaurants et cafés"
    }
  },
  {
    "id": "groceries",
    "engine": "retail",
    "name": {
      "ar": "البقالة",
      "en": "Groceries",
      "fr": "Épiceries"
    }
  },
  {
    "id": "clothing",
    "engine": "retail",
    "name": {
      "ar": "الملابس",
      "en": "Clothing",
      "fr": "Vêtements"
    }
  },
  {
    "id": "perfumes",
    "engine": "retail",
    "name": {
      "ar": "العطور",
      "en": "Perfumes",
      "fr": "Parfums"
    }
  },
  {
    "id": "accessories",
    "engine": "retail",
    "name": {
      "ar": "الإكسسوارات",
      "en": "Accessories",
      "fr": "Accessoires"
    }
  },
  {
    "id": "watches",
    "engine": "retail",
    "name": {
      "ar": "الساعات",
      "en": "Watches",
      "fr": "Montres"
    }
  },
  {
    "id": "gifts",
    "engine": "retail",
    "name": {
      "ar": "الهدايا والتغليف",
      "en": "Gifts & wrapping",
      "fr": "Cadeaux et emballage"
    }
  },
  {
    "id": "carwash",
    "engine": "services",
    "name": {
      "ar": "غسيل السيارات",
      "en": "Car wash",
      "fr": "Lavage automobile"
    }
  },
  {
    "id": "laundry",
    "engine": "services",
    "name": {
      "ar": "المغاسل",
      "en": "Laundry",
      "fr": "Blanchisseries"
    }
  },
  {
    "id": "automotive",
    "engine": "services",
    "name": {
      "ar": "خدمات السيارات",
      "en": "Automotive services",
      "fr": "Services automobiles"
    }
  },
  {
    "id": "beauty",
    "engine": "appointments",
    "name": {
      "ar": "الصالونات والتجميل",
      "en": "Beauty & salons",
      "fr": "Salons et beauté"
    }
  },
  {
    "id": "works",
    "engine": "services",
    "name": {
      "ar": "الأعمال والخدمات العامة",
      "en": "General services",
      "fr": "Services généraux"
    }
  },
  {
    "id": "sweets",
    "engine": "food",
    "name": {
      "ar": "الحلويات",
      "en": "Sweets",
      "fr": "Pâtisseries"
    }
  },
  {
    "id": "ecommerce",
    "engine": "retail",
    "name": {
      "ar": "التجارة الإلكترونية",
      "en": "E-commerce",
      "fr": "Commerce en ligne"
    }
  }
] as const;
export type ActivityId = typeof activities[number]["id"];
