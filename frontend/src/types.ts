export interface Category {
    id: number;
    name: string;
    slug: string;
  }
  
  export interface Post {
    id: number;
    title: string;
    content: string;
    category: string;
    image: string;
    author: string;
    created_at: string;
    updated_at: string;
    views: number;
  }