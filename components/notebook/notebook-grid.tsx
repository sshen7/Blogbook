"use client";

import Link from "next/link";
import { NotebookCard } from "./notebook-card";

interface Notebook {
  id: string;
  title: string;
  description: string | null;
  coverType: string;
  coverValue: string;
  theme: string;
  _count: {
    notes: number;
  };
}

interface NotebookGridProps {
  notebooks: Notebook[];
}

export function NotebookGrid({ notebooks }: NotebookGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {notebooks.map((notebook) => (
        <Link key={notebook.id} href={`/notebook/${notebook.id}`}>
          <NotebookCard notebook={notebook} />
        </Link>
      ))}
    </div>
  );
}
