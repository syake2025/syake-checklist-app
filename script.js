
const STORAGE_KEY = "syakeChecklistItems";

let items = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [
  { id: 1, name: "モバイルバッテリー", qty: 1, category: "旅行", done: false },
  { id: 2, name: "飲料水", qty: 3, category: "防災", done: false },
  { id: 3, name: "買い物メモ確認", qty: 1, category: "買い物", done: false }
];

const itemName = document.getElementById("itemName");
const itemQty = document.getElementById("itemQty");
const itemCategory = document.getElementById("itemCategory");
const addButton = document.getElementById("addButton");
const filterCategory = document.getElementById("filterCategory");
const exportButton = document.getElementById("exportButton");
const clearButton = document.getElementById("clearButton");
const checklist = document.getElementById("checklist");
const progressText = document.getElementById("progressText");

function saveItems() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function renderItems() {
  const filter = filterCategory.value;
  checklist.innerHTML = "";

  const filteredItems = filter === "すべて"
    ? items
    : items.filter(item => item.category === filter);

  filteredItems.forEach(item => {
    const row = document.createElement("div");
    row.className = item.done ? "check-item done" : "check-item";

    row.innerHTML = `
      <input type="checkbox" ${item.done ? "checked" : ""} data-id="${item.id}">
      <span class="item-name">${escapeHtml(item.name)}</span>
      <span class="qty-display">数量：${item.qty}</span>
      <span class="item-category">${item.category}</span>
      <button class="delete-button" data-delete-id="${item.id}">削除</button>
    `;

    checklist.appendChild(row);
  });

  updateProgress();
}

function updateProgress() {
  const total = items.length;
  const done = items.filter(item => item.done).length;
  progressText.textContent = `${done} / ${total} 完了`;
}

function addItem() {
  const name = itemName.value.trim();
  const qty = Number(itemQty.value);
  const category = itemCategory.value;

  if (!name) {
    alert("項目名を入力してください。");
    return;
  }

  const newItem = {
    id: Date.now(),
    name,
    qty: qty > 0 ? qty : 1,
    category,
    done: false
  };

  items.push(newItem);
  saveItems();
  renderItems();

  itemName.value = "";
  itemQty.value = 1;
}

function toggleItem(id) {
  items = items.map(item => {
    if (item.id === id) {
      return { ...item, done: !item.done };
    }
    return item;
  });

  saveItems();
  renderItems();
}

function deleteItem(id) {
  items = items.filter(item => item.id !== id);
  saveItems();
  renderItems();
}

function clearAllItems() {
  const result = confirm("すべての項目を削除します。よろしいですか？");
  if (!result) return;

  items = [];
  saveItems();
  renderItems();
}

function exportCsv() {
  if (items.length === 0) {
    alert("出力するデータがありません。");
    return;
  }

  const header = ["項目名", "数量", "カテゴリ", "完了"];
  const rows = items.map(item => [
    item.name,
    item.qty,
    item.category,
    item.done ? "完了" : "未完了"
  ]);

  const csvContent = [header, ...rows]
    .map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "syake-checklist.csv";
  link.click();

  URL.revokeObjectURL(url);
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

addButton.addEventListener("click", addItem);

itemName.addEventListener("keydown", event => {
  if (event.key === "Enter") {
    addItem();
  }
});

filterCategory.addEventListener("change", renderItems);
exportButton.addEventListener("click", exportCsv);
clearButton.addEventListener("click", clearAllItems);

checklist.addEventListener("click", event => {
  const checkboxId = event.target.dataset.id;
  const deleteId = event.target.dataset.deleteId;

  if (checkboxId) {
    toggleItem(Number(checkboxId));
  }

  if (deleteId) {
    deleteItem(Number(deleteId));
  }
});

renderItems();
