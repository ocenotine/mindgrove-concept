
// Define the Document interface with camelCase properties
export interface Document {
  id: string;
  title: string;
  content: string;
  fileType?: string;
  filePath?: string;
  userId: string;
  createdAt?: string;
  updatedAt?: string;
  summary?: string;
  description?: string;
  lastAccessed?: string;
  pages?: number;
  thumbnail?: string;
}

// Define the Flashcard interface 
export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  front_content?: string;
  back_content?: string;
  documentId: string;
  createdAt: string;
  userId: string;
}

// Mock data for documents
export const mockDocuments: Document[] = [
  {
    id: '1',
    title: 'Introduction to React',
    content: 'This is a basic introduction to React. React is a JavaScript library for building user interfaces.',
    fileType: 'PDF',
    filePath: '/path/to/react-intro.pdf',
    userId: '101',
    createdAt: '2023-01-01T12:00:00Z',
    updatedAt: '2023-01-05T14:30:00Z',
    summary: 'A brief overview of React and its core concepts.'
  },
  {
    id: '2',
    title: 'Advanced JavaScript Concepts',
    content: 'This document covers advanced JavaScript concepts such as closures, prototypes, and asynchronous programming.',
    fileType: 'DOCX',
    filePath: '/path/to/advanced-js.docx',
    userId: '101',
    createdAt: '2023-02-15T09:00:00Z',
    updatedAt: '2023-02-20T11:45:00Z',
    summary: 'In-depth explanation of advanced JavaScript topics.'
  },
  {
    id: '3',
    title: 'Guide to CSS Layouts',
    content: 'An extensive guide on CSS layouts, including Flexbox and Grid. Learn how to create responsive and dynamic layouts.',
    fileType: 'TXT',
    filePath: '/path/to/css-layouts.txt',
    userId: '102',
    createdAt: '2023-03-10T15:00:00Z',
    updatedAt: '2023-03-15T16:15:00Z',
    summary: 'Comprehensive guide on mastering CSS layouts with Flexbox and Grid.'
  },
  {
    id: '4',
    title: 'Node.js Best Practices',
    content: 'A collection of best practices for Node.js development, covering topics such as security, performance, and scalability.',
    fileType: 'PDF',
    filePath: '/path/to/nodejs-best-practices.pdf',
    userId: '102',
    createdAt: '2023-04-01T10:00:00Z',
    updatedAt: '2023-04-05T13:00:00Z',
    summary: 'Essential best practices for building robust Node.js applications.'
  },
  {
    id: '5',
    title: 'Python for Data Science',
    content: 'An introduction to Python for data science, covering libraries such as NumPy, Pandas, and Matplotlib.',
    fileType: 'DOCX',
    filePath: '/path/to/python-data-science.docx',
    userId: '103',
    createdAt: '2023-05-20T08:00:00Z',
    updatedAt: '2023-05-25T10:30:00Z',
    summary: 'Getting started with Python for data analysis and machine learning.'
  },
];
