import { Link } from "react-router-dom";
import { useCart } from "../lib/Cart";

export default function Header({ onOpenCart }) {
  const items = useCart((s) => s.items);
  const totalQty = items.reduce((n, i) => n + i.qty, 0);

  return (
    <header className="header" role="banner">
      <div className="header__inner">
        <nav className="nav nav--left" aria-label="Primary">
          <Link to="/" className="nav__link">
            Home
          </Link>
          <Link to="/profile" className="nav__link">
            Profile
          </Link>
        </nav>

        <Link className="brand" to="/">
          Mock Shop
        </Link>

        <div className="nav nav--right">
          <button
            className="btn btn--cart"
            onClick={onOpenCart}
            aria-label={`Open cart. ${totalQty} items`}
          >
            <span>Cart</span>
            {totalQty > 0 && <span className="badge">{totalQty}</span>}
          </button>
        </div>
      </div>
    </header>
  );
}
