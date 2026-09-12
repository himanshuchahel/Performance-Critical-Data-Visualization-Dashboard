self.onmessage = (e: MessageEvent) => {
  const { action, rows, filter } = e.data;
  if (action === "filter") {
    const res = rows.filter((r: any) => r.name?.includes(filter || ""));
    self.postMessage({ action: "filtered", count: res.length, data: res.slice(0, 100) });
  } else if (action === "generate") {
    const out = [];
    for (let i = 0; i < Math.min(rows, 5000); i++) out.push({ id: i, value: Math.random() * 100 });
    self.postMessage({ action: "generated", count: out.length, data: out });
  } else {
    self.postMessage({ action: "done", count: 0 });
  }
};
