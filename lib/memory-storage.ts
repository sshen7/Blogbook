// 内存存储模块，用于模拟数据库

// 笔记存储
let notes: any[] = [];

// 笔记本存储
let notebooks: any[] = [];

// 标签存储
let tags: any[] = [];

// 导出存储对象
export const memoryStorage = {
  // 笔记相关操作
  notes: {
    get: (id?: string, notebookId?: string) => {
      if (id) {
        return notes.find(note => note.id === id);
      }
      if (notebookId) {
        return notes.filter(note => note.notebookId === notebookId);
      }
      return notes;
    },
    create: (note: any) => {
      notes.push(note);
      return note;
    },
    update: (id: string, data: any) => {
      const index = notes.findIndex(note => note.id === id);
      if (index === -1) return null;
      notes[index] = { ...notes[index], ...data };
      return notes[index];
    },
    delete: (id: string) => {
      const index = notes.findIndex(note => note.id === id);
      if (index === -1) return false;
      notes.splice(index, 1);
      return true;
    }
  },

  // 笔记本相关操作
  notebooks: {
    get: (id?: string) => {
      if (id) {
        const notebook = notebooks.find(notebook => notebook.id === id);
        if (notebook) {
          // 添加关联的笔记
          const notebookNotes = notes.filter(note => note.notebookId === id);
          return {
            ...notebook,
            notes: notebookNotes,
            _count: {
              notes: notebookNotes.length
            }
          };
        }
        return null;
      }
      return notebooks.filter(notebook => !notebook.isArchived);
    },
    create: (notebook: any) => {
      notebooks.push(notebook);
      return notebook;
    },
    update: (id: string, data: any) => {
      const index = notebooks.findIndex(notebook => notebook.id === id);
      if (index === -1) return null;
      notebooks[index] = { ...notebooks[index], ...data };
      return notebooks[index];
    },
    delete: (id: string) => {
      const index = notebooks.findIndex(notebook => notebook.id === id);
      if (index === -1) return false;
      notebooks.splice(index, 1);
      // 同时删除关联的笔记
      notes = notes.filter(note => note.notebookId !== id);
      return true;
    }
  },

  // 标签相关操作
  tags: {
    get: (userId: string) => {
      return tags.filter(tag => tag.userId === userId);
    },
    create: (tag: any) => {
      tags.push(tag);
      return tag;
    },
    update: (id: string, data: any) => {
      const index = tags.findIndex(tag => tag.id === id);
      if (index === -1) return null;
      tags[index] = { ...tags[index], ...data };
      return tags[index];
    },
    delete: (id: string) => {
      const index = tags.findIndex(tag => tag.id === id);
      if (index === -1) return false;
      tags.splice(index, 1);
      return true;
    }
  }
};
