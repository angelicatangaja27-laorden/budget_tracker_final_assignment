import type { CategoryTotal } from "@/lib/calculations";
import { formatPercent, formatPeso } from "@/lib/format";
import type { Category } from "@/types/budget";

const HIGHLIGHT_COUNT = 3;

type CategoryTableProps = {
  title: string;
  description: string;
  totals: CategoryTotal[];
  highlightTop?: boolean;
  onDelete: (category: Category) => void;
};

export default function CategoryTable({
  title,
  description,
  totals,
  highlightTop = false,
  onDelete,
}: CategoryTableProps) {
  const largest = totals[0]?.totalCentavos ?? 0;

  return (
    <section className="card">
      <div className="card-header">
        <div>
          <h2>{title}</h2>
          <p className="card-note">{description}</p>
        </div>
      </div>
      <ul className="category-list">
        {totals.map((item, index) => {
          const isTop = highlightTop && index < HIGHLIGHT_COUNT && item.totalCentavos > 0;
          const width = largest > 0 ? (item.totalCentavos / largest) * 100 : 0;

          return (
            <li key={item.category.id} className={isTop ? "category-item top" : "category-item"}>
              <div className="category-main">
                <span className="category-name">
                  {item.category.name}
                  {item.category.isCustom && <span className="pill neutral">Custom</span>}
                  {isTop && <span className="pill highlight">#{index + 1} highest</span>}
                </span>
                <span className="category-total">{formatPeso(item.totalCentavos)}</span>
              </div>
              <div className="meter" aria-hidden="true">
                <span style={{ width: `${width}%` }} />
              </div>
              <div className="category-meta">
                <span>
                  {item.count} {item.count === 1 ? "transaction" : "transactions"} ·{" "}
                  {formatPercent(item.share)}
                </span>
                {item.category.isCustom && (
                  <button
                    type="button"
                    className="button ghost small danger"
                    aria-label={`Delete ${item.category.name}`}
                    onClick={() => onDelete(item.category)}
                  >
                    Delete
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
