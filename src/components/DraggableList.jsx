// ドラッグ&ドロップで並び替えができるリストコンポーネント
// 管理者画面でアイテムの順番を変えるときに使う
import { useState, useRef } from "react";

export default function DraggableList({ items, onReorder, renderItem }) {
  const [dragging, setDragging] = useState(null); // ドラッグ中のインデックス
  const dragOver = useRef(null);                   // ドロップ先のインデックス

  const handleDragStart = (i) => setDragging(i);
  const handleDragEnter = (i) => { dragOver.current = i; };
  const handleDragEnd = () => {
    // ドラッグ開始・終了位置が有効な場合のみ並び替え実行
    if (dragging === null || dragOver.current === null || dragging === dragOver.current) {
      setDragging(null);
      dragOver.current = null;
      return;
    }
    const next = [...items];
    const [moved] = next.splice(dragging, 1);
    next.splice(dragOver.current, 0, moved);
    onReorder(next);
    setDragging(null);
    dragOver.current = null;
  };

  return (
    <div>
      {items.map((item, i) => (
        <div
          key={item.name || item}
          draggable
          onDragStart={() => handleDragStart(i)}
          onDragEnter={() => handleDragEnter(i)}
          onDragEnd={handleDragEnd}
          onDragOver={(e) => e.preventDefault()}
          style={{ cursor: "grab", userSelect: "none" }}
        >
          {renderItem(item, i)}
        </div>
      ))}
    </div>
  );
}