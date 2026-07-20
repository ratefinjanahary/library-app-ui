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
  id: number;
  userId: number;
  inventoryItemId: number;
  borrowDate: string;
  dueDate: string;
  returnDate: string | null;
  status: 'BORROWED' | 'RETURNED' | 'OVERDUE';
  inventory?: {
    id: number;
    status: string;
    book?: {
      id: number;
      title: string;
      author: string;
      isbn: string;
      publisher: string;
      publicationYear: number;
      category: string;
      description: string;
    };
  };
  fines?: Fine[];
}

export interface Fine {
  id: number;
  borrowingId: number;
  amount: number;
  paidAt: string | null;
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
