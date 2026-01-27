import { Payments, Star, TrendingUp } from '@mui/icons-material'

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
    color === 'primary' ? 'bg-blue-500 shadow-blue-500/20' : 'bg-amber-500 shadow-orange-500/20'

  return (
    <div className={`relative overflow-hidden ${cardClasses} p-6 rounded-3xl shadow-lg text-white`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium opacity-80 mb-1">{title}</p>
          <h2 className="text-3xl font-bold">{value}</h2>
        </div>
        <div className="bg-white/20 p-2 rounded-xl">
          {isRevenue ? <Payments fontSize="medium" /> : <Star fontSize="medium" />}
        </div>
      </div>
      <p className="mt-4 text-xs opacity-70">{subtitle}</p>
      {isRevenue && (
        <div className="absolute -right-4 -bottom-4 opacity-10">
          <TrendingUp style={{ fontSize: '4rem' }} />
        </div>
      )}
    </div>
  )
}
