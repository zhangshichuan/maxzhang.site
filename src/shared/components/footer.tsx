export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer>
      <div className="sig">&#x263B;</div>
      <div className="note">Max Zhang &copy; {currentYear} · Particles never lie</div>
    </footer>
  )
}
