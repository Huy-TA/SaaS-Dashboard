/* Chỉ donut (two, 44px) và line nhiều đường (24px). Chỉ màu + tên nhóm, không số liệu. */
export function Legend({ items, two }: { items: { name: string; color: string }[]; two?: boolean }) {
  return (
    <div className={`lgd${two ? ' two' : ''}`}>
      {items.map((i) => (
        <span className="li" key={i.name}>
          <i style={{ background: i.color }} /><b>{i.name}</b>
        </span>
      ))}
    </div>
  );
}
