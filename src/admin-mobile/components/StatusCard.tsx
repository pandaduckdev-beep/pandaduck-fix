interface StatusCardProps {
  label: string
  count: number
  color: 'yellow' | 'blue' | 'purple' | 'green' | 'red'
}

const colorClasses = {
  yellow: {
    bg: 'bg-[#FFF9E6]',
    text: 'text-[#FF9500]',
    count: 'text-[#1D1D1F]',
  },
  blue: {
    bg: 'bg-[#E6F2FF]',
    text: 'text-[#007AFF]',
    count: 'text-[#1D1D1F]',
  },
  purple: {
    bg: 'bg-[#F3E6FF]',
    text: 'text-[#AF52DE]',
    count: 'text-[#1D1D1F]',
  },
  green: {
    bg: 'bg-[#E6F9F0]',
    text: 'text-[#34C759]',
    count: 'text-[#1D1D1F]',
  },
  red: {
    bg: 'bg-[#FFE6E6]',
    text: 'text-[#FF3B30]',
    count: 'text-[#1D1D1F]',
  },
}

export function StatusCard({ label, count, color }: StatusCardProps) {
  const classes = colorClasses[color]

  return (
    <div className={`min-w-[100px] ${classes.bg} p-3.5 rounded-lg transition-transform active:scale-95`}>
      <p className={`text-xs ${classes.text} mb-1`} style={{ fontWeight: 600 }}>
        {label}
      </p>
      <p className={`text-2xl ${classes.count}`} style={{ fontWeight: 700, letterSpacing: '-0.02em' }}>
        {count}
      </p>
    </div>
  )
}
