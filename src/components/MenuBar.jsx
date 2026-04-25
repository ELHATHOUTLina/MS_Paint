function MenuBar() {
  const items = ['File', 'Edit', 'View', 'Image', 'Colors', 'Help']

  return (
    <nav className="menu-bar" aria-label="Main menu">
      {items.map((item) => (
        <button key={item} type="button" className="menu-item">
          {item}
        </button>
      ))}
    </nav>
  )
}

export default MenuBar
