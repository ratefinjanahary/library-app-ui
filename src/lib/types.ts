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
  id: number; // Changé de string à number pour correspondre au backend
  name: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    books: number;
  };
}

export interface Book {
  id: number; // Changé de string à number
  title: string;
  author: string;
  isbn: string;
  summary?: string;
  categoryId: number;
  category?: Category;
  inventoryItems?: InventoryItem[]; // Changé de inventory à inventoryItems
  createdAt: string;
  updatedAt: string;
}

// Nouvelle interface correspondant à InventoryItem du backend
export interface InventoryItem {
  id: number;
  bookId: number;
  barcode: string;
  status: 'AVAILABLE' | 'BORROWED' | 'MAINTENANCE';
  condition?: string;
  book?: Book;
  borrowings?: Borrowing[];
}

// Garder l'ancienne interface pour compatibilité mais marquer comme dépréciée
/** @deprecated Use InventoryItem instead */
export interface Inventory {
  id: string;
  bookId: string;
  quantity: number;
  book?: Book;
  createdAt: string;
  updatedAt: string;
}

export interface Borrowing {
  inventory: any;
  id: number;
  userId: number;
  inventoryItemId: number;
  borrowedAt: string; // Changé de borrowDate
  dueDate: string;
  returnedAt: string | null; // Changé de returnDate
  status: 'BORROWED' | 'RETURNED' | 'OVERDUE' | 'ACTIVE';
  inventoryItem?: { // Changé de inventory à inventoryItem
    id: number;
    status: string;
    book?: {
      id: number;
      title: string;
      author: string;
      isbn: string;
      publisher?: string;
      publicationYear?: number;
      category?: string;
      description?: string;
      summary?: string;
    };
  };
  fines?: Fine[];
}

export interface Fine {
  id: number;
  borrowingId: number;
  amount: number;
  status: 'UNPAID' | 'PAID';
  createdAt: string;
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
  book: {
    title: string;
    author: string;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}