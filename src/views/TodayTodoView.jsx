import { CheckSquare, Clock } from 'lucide-react';

export default function TodayTodoView() {
  const todoItems = [
    '确认取消率前端显示正确',
    '上传 ERP Excel 测试数据',
    'push 代码到 git',
  ];

  return (
    <div className="h-full bg-slate-50 p-6 overflow-y-auto font-sans">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-sm">
              <CheckSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800">今日待办</h1>
              <p className="text-xs text-slate-400">{todoItems.length} 项</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Clock className="w-3.5 h-3.5" />
            <span>{new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' })}</span>
          </div>
        </div>

        {/* Todo List */}
        <div className="space-y-2">
          {todoItems.map((item, i) => (
            <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex items-center gap-3">
              <div className="w-5 h-5 rounded-md border-2 border-emerald-500 flex items-center justify-center shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              </div>
              <span className="text-sm text-slate-700">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
