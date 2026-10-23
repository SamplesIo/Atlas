type SealProps = {
  chars?: string
  className?: string
}

export function Seal({ chars = '贰零贰伍', className = '' }: SealProps) {
  return (
    <span className={`seal ${className}`.trim()} aria-hidden="true">
      {Array.from(chars).map((char, index) => (
        <span key={`${char}-${index}`}>{char}</span>
      ))}
    </span>
  )
}
