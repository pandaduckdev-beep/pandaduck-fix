import { DollarSign, Star } from 'lucide-react'

interface DashboardCardProps {
  title: string
  value: string | number
  subtitle: string
  type: 'revenue' | 'satisfaction'
  color?: 'primary' | 'secondary'
}

export function DashboardCard({
  title,
  value,
  subtitle,
  type,
  color = 'primary',
}: DashboardCardProps) {
  const isRevenue = type === 'revenue'

  const cardClasses =
    color === 'primary'
      ? 'bg-gradient-to-br from-[var(--ios-blue)] to-[#0051D5]'
      : 'bg-gradient-to-br from-[#FF9500] to-[#FF6B00]'

  return (
    <div className={`relative overflow-hidden ${cardClasses} p-6 rounded-2xl text-white`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm opacity-90 mb-1" style={{ fontWeight: 600 }}>
            {title}
          </p>
          <h2 className="text-3xl mb-3" style={{ fontWeight: 700, letterSpacing: '-0.02em' }}>
            {value}
          </h2>
          <p className="text-xs opacity-80">{subtitle}</p>
        </div>
        <div className="bg-white/20 p-2.5 rounded-xl">
          {isRevenue ? <DollarSign className="w-5 h-5" /> : <Star className="w-5 h-5" />}
        </div>
      </div>
    </div>
  )
}
