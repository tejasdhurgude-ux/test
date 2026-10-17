interface HeaderProps {
  userEmail: string;
  cartCount: number;
  onLogout: () => void;
}

export function Header({ userEmail, cartCount, onLogout }: HeaderProps) {
  return (
    <header className="header">
      <div className="header__brand">
        <span className="header__logo" aria-hidden="true">S</span>
        <div>
          <p className="header__name">Sahyadri</p>
          <p className="header__title">Billing System</p>
        </div>
      </div>
      <div className="header__actions">
        <a className="header__cart" href="#cart" aria-label={`${cartCount} items in cart`}>
          Cart <span className="badge">{cartCount}</span>
        </a>
        <span className="header__user" title={userEmail}>{userEmail}</span>
        <button type="button" className="btn btn--ghost" onClick={onLogout}>Log out</button>
      </div>
    </header>
  );
}
