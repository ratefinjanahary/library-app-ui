export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'MEMBER' | 'ADMIN';
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  categoryId: number;
  category?: Category;
  inventory?: Inventory[];
  createdAt: string;
  updatedAt: string;
}

export interface Inventory {
  id: string;
  bookId: string;
  quantity: number;
  book?: Book;
  createdAt: string;
  updatedAt: string;
}

export interface Borrowing {
  id: string;
  userId: string;
  inventoryId: string;
  borrowDate: string;
  dueDate: string;
  returnDate: string | null;
  status: 'BORROWED' | 'RETURNED' | 'OVERDUE';
  inventory?: Inventory;
  user?: User;
  createdAt: string;
  updatedAt: string;
}

export interface AnalyticsKPIs {
  totalBooks: number;
  totalMembers: number;
  activeBorrowings: number;
  overdueBorrowings: number;
}

export interface TopBook {
  bookId: string;
  title: string;
  author: string;
  borrowCount: number;
}
