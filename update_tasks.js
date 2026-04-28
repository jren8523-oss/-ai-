const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

const start_marker = '{/* Task Lists */}';
const end_marker = '                            </>\n                          )}\n                        </div>\n                      )}\n                    </>\n                  ) : (';

const start_idx = content.indexOf(start_marker);
const end_idx = content.indexOf(end_marker);

if (start_idx === -1 || end_idx === -1) {
    console.log('Could not find markers');
    process.exit(1);
}

const replacement_html = `{/* Task Lists */}
                              <div className="space-y-3">
                                {mockTasks.filter(t => t.sourceOrg === currentOrgName && t.status === taskTab).length === 0 ? (
                                  <div className="text-center py-10 mt-6 cursor-default">
                                    <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                      <Check size={28} className="text-zinc-400" strokeWidth={2.5} />
                                    </div>
                                    <h3 className="text-[16px] font-bold text-zinc-800 mb-1">
                                      当前组织暂无待办事项
                                    </h3>
                                    <p className="text-[13px] text-zinc-500">
                                      太棒了，所有任务都已清空
                                    </p>
                                  </div>
                                ) : (
                                  mockTasks.filter(t => t.sourceOrg === currentOrgName && t.status === taskTab).map(task => {
                                    if (task.status === "pending") {
                                      if (task.formId === "textbook") {
                                        return (
                                          <div key={task.id} className="bg-white rounded-[20px] p-4 border border-blue-100 shadow-[0_2px_12px_rgba(37,99,235,0.04)]">
                                            <div>
                                              <h4 className="text-[15px] font-bold text-zinc-900 mb-1.5 flex items-center justify-between">
                                                <span>教材征订</span>
                                                {orderLocked && (
                                                  <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                                                    已确权
                                                  </span>
                                                )}
                                              </h4>
                                              <div className="space-y-3 mt-4 mb-4">
                                                <div className="flex items-center justify-between">
                                                  <div className="flex flex-col">
                                                    <span className="text-[14px] font-medium text-zinc-800">《法理学》</span>
                                                    <span className="text-[12px] font-bold text-zinc-400">￥45.00</span>
                                                  </div>
                                                  <div className="flex items-center gap-3">
                                                    <button
                                                      onClick={() => setOrderAmount((prev) => ({ ...prev, law: Math.max(0, prev.law - 1) }))}
                                                      disabled={orderLocked}
                                                      className={\`w-7 h-7 rounded-full flex items-center justify-center font-medium bg-zinc-100 transition-colors \${orderLocked ? "text-zinc-300" : "text-zinc-600 active:bg-zinc-200"}\`}
                                                    >
                                                      -
                                                    </button>
                                                    <span className={\`w-4 text-center font-bold text-[14px] \${orderLocked ? "text-zinc-400" : "text-zinc-800"}\`}>
                                                      {orderAmount.law}
                                                    </span>
                                                    <button
                                                      onClick={() => setOrderAmount((prev) => ({ ...prev, law: prev.law + 1 }))}
                                                      disabled={orderLocked}
                                                      className={\`w-7 h-7 rounded-full flex items-center justify-center font-medium bg-zinc-100 transition-colors \${orderLocked ? "text-zinc-300" : "text-zinc-600 active:bg-zinc-200"}\`}
                                                    >
                                                      +
                                                    </button>
                                                  </div>
                                                </div>
                                                <div className="flex items-center justify-between pt-3 border-t border-zinc-50">
                                                  <div className="flex flex-col">
                                                    <span className="text-[14px] font-medium text-zinc-800">《民法典》</span>
                                                    <span className="text-[12px] font-bold text-zinc-400">￥60.00</span>
                                                  </div>
                                                  <div className="flex items-center gap-3">
                                                    <button
                                                      onClick={() => setOrderAmount((prev) => ({ ...prev, civil: Math.max(0, prev.civil - 1) }))}
                                                      disabled={orderLocked}
                                                      className={\`w-7 h-7 rounded-full flex items-center justify-center font-medium bg-zinc-100 transition-colors \${orderLocked ? "text-zinc-300" : "text-zinc-600 active:bg-zinc-200"}\`}
                                                    >
                                                      -
                                                    </button>
                                                    <span className={\`w-4 text-center font-bold text-[14px] \${orderLocked ? "text-zinc-400" : "text-zinc-800"}\`}>
                                                      {orderAmount.civil}
                                                    </span>
                                                    <button
                                                      onClick={() => setOrderAmount((prev) => ({ ...prev, civil: prev.civil + 1 }))}
                                                      disabled={orderLocked}
                                                      className={\`w-7 h-7 rounded-full flex items-center justify-center font-medium bg-zinc-100 transition-colors \${orderLocked ? "text-zinc-300" : "text-zinc-600 active:bg-zinc-200"}\`}
                                                    >
                                                      +
                                                    </button>
                                                  </div>
                                                </div>
                                              </div>
                                              <div className="flex items-center justify-between pb-4 border-b border-zinc-100/60">
                                                <span className="text-[13px] font-bold text-zinc-500">预估总额</span>
                                                <span className="text-[16px] font-black text-blue-600">
                                                  ￥{(orderAmount.law * 45 + orderAmount.civil * 60).toFixed(2)}
                                                </span>
                                              </div>
                                              <div className="mt-4 flex gap-2.5">
                                                <button
                                                  onClick={() => { if (orderLocked) { setOrderLocked(false); showToast("请在班委封账前修改"); } }}
                                                  disabled={!orderLocked}
                                                  className={\`font-bold text-[13px] py-2.5 rounded-xl transition-colors flex-[0.4] \${orderLocked ? "bg-zinc-100 text-zinc-600 active:bg-zinc-200" : "bg-transparent text-zinc-400 border border-zinc-200"}\`}
                                                >修改订单</button>
                                                <button
                                                  onClick={handleOrderSubmit}
                                                  disabled={orderLocked || isOrderSubmitting}
                                                  className={\`flex-1 font-bold text-[13px] py-2.5 rounded-xl transition-colors \${orderLocked ? "bg-zinc-100 text-zinc-400 cursor-not-allowed" : isOrderSubmitting ? "bg-blue-300 text-white cursor-wait" : "bg-blue-600 text-white active:bg-blue-700 shadow-sm"}\`}
                                                >{orderLocked ? "🔒 交易快照已固化" : isOrderSubmitting ? "..." : "确认征订并存证"}</button>
                                              </div>
                                            </div>
                                          </div>
                                        );
                                      } else {
                                        return (
                                          <div key={task.id} className={\`bg-white rounded-[20px] p-4 border shadow-[0_2px_8px_rgba(0,0,0,0.02)] relative overflow-hidden active:scale-[0.98] transition-all \${task.priority === 'high' ? 'border-red-100' : 'border-zinc-200/60'}\`}>
                                            {task.priority === 'high' && (
                                              <div className="absolute top-0 left-0 w-1 h-full bg-red-400"></div>
                                            )}
                                            <div className={\`\${task.priority === 'high' ? 'pl-1' : ''}\`}>
                                              <h4 className="text-[15px] font-bold text-zinc-900 mb-1.5 line-clamp-1">
                                                {task.title}
                                              </h4>
                                              <p className="text-[12px] text-zinc-500 flex items-center gap-1.5 font-medium">
                                                <Clock size={14} className={task.priority === 'high' ? "text-red-500" : "text-zinc-400"} />
                                                {task.deadline}
                                              </p>
                                              <button
                                                onClick={() => setActiveTaskForm(task.formId)}
                                                className={\`mt-4 font-bold text-[13px] py-2.5 rounded-xl w-full \${task.priority === 'high' ? "bg-red-50 text-red-600 active:bg-red-100" : "bg-[#f6f7f9] text-zinc-700 active:bg-zinc-200"}\`}
                                              >查阅与提交</button>
                                            </div>
                                          </div>
                                        );
                                      }
                                    } else {
                                      return (
                                        <div key={task.id} className="bg-white rounded-[20px] p-4 border border-zinc-200/60 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex items-center justify-between">
                                          <div className="pr-4 min-w-0">
                                            <h4 className="text-[15px] font-bold text-zinc-900 mb-1.5 line-through decoration-zinc-300 truncate">
                                              {task.title}
                                            </h4>
                                            <p className="text-[12px] text-zinc-400 font-medium">
                                              {task.deadline}
                                            </p>
                                          </div>
                                          <div className="w-[34px] h-[34px] rounded-full bg-green-50 flex items-center justify-center shrink-0 border border-green-100">
                                            <Check size={18} className="text-green-600" strokeWidth={3} />
                                          </div>
                                        </div>
                                      );
                                    }
                                  })
                                )}
                              </div>
\n`;

const new_content = content.substring(0, start_idx) + replacement_html + content.substring(end_idx);

fs.writeFileSync('src/App.tsx', new_content);
console.log('Success');
