export interface Category {
  id: number;
  name: string; // строго строка
  slug: string;
}

export interface Post {
  id: number;
  title: string;
  content: string;
  category: number; // ID категории (число)
  image: string;
  author: string;
  created_at: string;
  updated_at: string;
  views: number;
}