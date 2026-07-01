export function Logo({ className = "" }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 108.89 108.86" fill="currentColor">
      <path d="M0,31.41L54.45,0l54.44,31.41v57l-12.59,7.27v-56.96L54.47,14.56,12.59,38.72v56.96l-12.59-7.27V31.41Z"/>
      <path d="M35.42,108.86l-13.01-7.52v-56.99l32.04-18.49,32.04,18.49v56.99l-13.01,7.52-19.03-10.99-19.03,10.99ZM73.48,93.84l.03-42.44-19.03-10.97-19.03,10.97-.03,42.43,19.02-10.99,19.04,11Z"/>
    </svg>
  )
}
