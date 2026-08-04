export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="site-footer">
      <p>Max Zhang &copy; {currentYear}</p>
    </footer>
  )
}
