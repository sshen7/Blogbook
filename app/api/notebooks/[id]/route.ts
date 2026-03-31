import { NextRequest, NextResponse } from "next/server";


export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 从全局对象获取最新的模拟数据
    const notebooks = global.mockNotebooks;
    
    const notebook = notebooks.find((note: any) => note.id === params.id);
    
    if (!notebook) {
      return NextResponse.json({ error: "未找到" }, { status: 404 });
    }

    // 模拟的笔记数据，根据笔记本ID返回对应的笔记
    let mockNotes = [];
    
    if (params.id === "1") {
      mockNotes = [
        {
          id: "note_1",
          title: "个人日记 - 第一天",
          content: "<p>今天是开始写日记的第一天，希望能坚持下去。</p>",
          order: 1,
          isStarred: false,
          wordCount: 15,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          tags: [],
          _count: {
            images: 0
          }
        },
        {
          id: "note_2",
          title: "个人日记 - 第二天",
          content: "<p>今天天气很好，出去散步了。</p>",
          order: 2,
          isStarred: false,
          wordCount: 10,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          tags: [],
          _count: {
            images: 0
          }
        },
        {
          id: "note_3",
          title: "个人日记 - 第三天",
          content: "<p>今天学习了新的知识，感觉很充实。</p>",
          order: 3,
          isStarred: true,
          wordCount: 12,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          tags: [],
          _count: {
            images: 0
          }
        }
      ];
    } else if (params.id === "2") {
      mockNotes = [
        {
          id: "note_4",
          title: "工作笔记 - 项目计划",
          content: "<p>下周项目启动，需要准备相关材料。</p>",
          order: 1,
          isStarred: false,
          wordCount: 12,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          tags: [],
          _count: {
            images: 0
          }
        },
        {
          id: "note_5",
          title: "工作笔记 - 会议记录",
          content: "<p>今天的会议讨论了项目的进展情况。</p>",
          order: 2,
          isStarred: false,
          wordCount: 15,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          tags: [],
          _count: {
            images: 0
          }
        },
        {
          id: "note_6",
          title: "工作笔记 - 任务分配",
          content: "<p>分配了新的任务，需要在下周完成。</p>",
          order: 3,
          isStarred: false,
          wordCount: 13,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          tags: [],
          _count: {
            images: 0
          }
        },
        {
          id: "note_7",
          title: "工作笔记 - 问题解决",
          content: "<p>解决了一个技术问题，记录一下解决方案。</p>",
          order: 4,
          isStarred: true,
          wordCount: 16,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          tags: [],
          _count: {
            images: 0
          }
        },
        {
          id: "note_8",
          title: "工作笔记 - 总结",
          content: "<p>本月工作总结，完成了所有计划的任务。</p>",
          order: 5,
          isStarred: false,
          wordCount: 14,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          tags: [],
          _count: {
            images: 0
          }
        }
      ];
    } else if (params.id === "3") {
      mockNotes = [
        {
          id: "note_9",
          title: "学习资料 - 编程笔记",
          content: "<p>今天学习了新的编程技巧。</p>",
          order: 1,
          isStarred: false,
          wordCount: 10,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          tags: [],
          _count: {
            images: 0
          }
        },
        {
          id: "note_10",
          title: "学习资料 - 算法学习",
          content: "<p>学习了一些新的算法，需要多练习。</p>",
          order: 2,
          isStarred: true,
          wordCount: 12,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          tags: [],
          _count: {
            images: 0
          }
        }
      ];
    }

    // 添加模拟的笔记数据
    const notebookWithNotes = {
      ...notebook,
      notes: mockNotes,
      _count: {
        notes: mockNotes.length
      }
    };

    return NextResponse.json(notebookWithNotes);
  } catch (error) {
    console.error("获取小册子失败:", error);
    return NextResponse.json({ error: "获取失败" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 从全局对象获取最新的模拟数据
    const notebooks = global.mockNotebooks;
    
    const index = notebooks.findIndex((note: any) => note.id === params.id);
    
    if (index === -1) {
      return NextResponse.json({ error: "未找到" }, { status: 404 });
    }

    const body = await req.json();
    
    notebooks[index] = {
      ...notebooks[index],
      ...body,
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json(notebooks[index]);
  } catch (error) {
    console.error("更新小册子失败:", error);
    return NextResponse.json({ error: "更新失败" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 从全局对象获取最新的模拟数据
    const notebooks = global.mockNotebooks;
    
    const index = notebooks.findIndex((note: any) => note.id === params.id);
    
    if (index === -1) {
      return NextResponse.json({ error: "未找到" }, { status: 404 });
    }

    notebooks.splice(index, 1);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("删除小册子失败:", error);
    return NextResponse.json({ error: "删除失败" }, { status: 500 });
  }
}
