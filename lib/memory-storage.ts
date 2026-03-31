// 内存存储模块，用于模拟数据库

// 从localStorage加载数据
const loadFromLocalStorage = () => {
  try {
    const savedNotes = localStorage.getItem('notes');
    const savedNotebooks = localStorage.getItem('notebooks');
    const savedTags = localStorage.getItem('tags');
    
    return {
      notes: savedNotes ? JSON.parse(savedNotes) : [],
      notebooks: savedNotebooks ? JSON.parse(savedNotebooks) : [],
      tags: savedTags ? JSON.parse(savedTags) : []
    };
  } catch (error) {
    console.error('加载localStorage数据失败:', error);
    return {
      notes: [],
      notebooks: [],
      tags: []
    };
  }
};

// 保存数据到localStorage
const saveToLocalStorage = (data: { notes: any[], notebooks: any[], tags: any[] }) => {
  try {
    localStorage.setItem('notes', JSON.stringify(data.notes));
    localStorage.setItem('notebooks', JSON.stringify(data.notebooks));
    localStorage.setItem('tags', JSON.stringify(data.tags));
  } catch (error) {
    console.error('保存localStorage数据失败:', error);
  }
};

// 初始化数据
const initialData = loadFromLocalStorage();

// 笔记存储
let notes: any[] = initialData.notes;

// 笔记本存储
let notebooks: any[] = initialData.notebooks;

// 标签存储
let tags: any[] = initialData.tags;

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
      saveToLocalStorage({ notes, notebooks, tags });
      return note;
    },
    update: (id: string, data: any) => {
      const index = notes.findIndex(note => note.id === id);
      if (index === -1) return null;
      notes[index] = { ...notes[index], ...data };
      saveToLocalStorage({ notes, notebooks, tags });
      return notes[index];
    },
    delete: (id: string) => {
      const index = notes.findIndex(note => note.id === id);
      if (index === -1) return false;
      notes.splice(index, 1);
      saveToLocalStorage({ notes, notebooks, tags });
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
      saveToLocalStorage({ notes, notebooks, tags });
      return notebook;
    },
    update: (id: string, data: any) => {
      const index = notebooks.findIndex(notebook => notebook.id === id);
      if (index === -1) return null;
      notebooks[index] = { ...notebooks[index], ...data };
      saveToLocalStorage({ notes, notebooks, tags });
      return notebooks[index];
    },
    delete: (id: string) => {
      const index = notebooks.findIndex(notebook => notebook.id === id);
      if (index === -1) return false;
      notebooks.splice(index, 1);
      // 同时删除关联的笔记
      notes = notes.filter(note => note.notebookId !== id);
      saveToLocalStorage({ notes, notebooks, tags });
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
      saveToLocalStorage({ notes, notebooks, tags });
      return tag;
    },
    update: (id: string, data: any) => {
      const index = tags.findIndex(tag => tag.id === id);
      if (index === -1) return null;
      tags[index] = { ...tags[index], ...data };
      saveToLocalStorage({ notes, notebooks, tags });
      return tags[index];
    },
    delete: (id: string) => {
      const index = tags.findIndex(tag => tag.id === id);
      if (index === -1) return false;
      tags.splice(index, 1);
      saveToLocalStorage({ notes, notebooks, tags });
      return true;
    }
  }
};
