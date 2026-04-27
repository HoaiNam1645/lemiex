export function SiteFooter() {
  return (
    <footer className='border-t bg-background/95'>
      <div className='mx-auto w-full max-w-7xl px-4 py-4 text-xs text-muted-foreground sm:px-6 lg:px-8'>
        <p className='font-semibold text-foreground'>DragonBug LLC</p>
        <p>
          Registered Address: 30 N Gould St Ste N Sheridan, WY 82801, Wyoming,
          United States
        </p>
        <p>
          Contact: <a href='mailto:contact@dragonbugllc.com' className='hover:underline'>contact@dragonbugllc.com</a> |{' '}
          <a href='tel:+13072485984' className='hover:underline'>+1 (307) 248-5984</a>
        </p>
        <p>
          Registered Agent: Nguyen Dang Ngoc Thanh (Thanh Dang Ngoc Nguyen) | Filing Date: 04/14/2026 | EIN: 98-1932106
        </p>
      </div>
    </footer>
  )
}
