export default function Filters({ categories, category, onSelect }) {
  return (
    <div className="filters">
      {categories.map((c) => (
        <button
          key={c.id}
          className={`chip ${category === c.id ? "chip--active" : ""}`}
          onClick={() => onSelect(c.id)}
        >
          {c.title}
        </button>
      ))}
    </div>
  );
}
