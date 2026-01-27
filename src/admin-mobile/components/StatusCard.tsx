interface StatusCardProps {
  label: string
  count: number
  color: 'yellow' | 'blue' | 'purple' | 'green' | 'red'
}

const colorClasses = {
  yellow: {
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    border: 'border-yellow-100 dark:border-yellow-800/50',
    text: 'text-yellow-600 dark:text-yellow-400',
    count: 'text-yellow-700 dark:text-yellow-300',
  },
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-100 dark:border-blue-800/50',
    text: 'text-blue-600 dark:text-blue-400',
    count: 'text-blue-700 dark:text-blue-300',
  },
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    border: 'border-purple-100 dark:border-purple-800/50',
    text: 'text-purple-600 dark:text-purple-400',
    count: 'text-purple-700 dark:text-purple-300',
  },
  green: {
    bg: 'bg-green-50 dark:bg-green-900/20',
    border: 'border-green-100 dark:border-green-800/50',
    text: 'text-green-600 dark:text-green-400',
    count: 'text-green-700 dark:text-green-300',
  },
  red: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-100 dark:border-red-800/50',
    text: 'text-red-600 dark:text-red-400',
    count: 'text-red-700 dark:text-red-300',
  },
}

export function StatusCard({ label, count, color }: StatusCardProps) {
  const classes = colorClasses[color]

  return (
    <div className={`min-w-[120px] ${classes.bg} ${classes.border} border p-4 rounded-2xl`}>
      <p className={`text-xs font-semibold ${classes.text} mb-1`}>{label}</p>
      <p className={`text-2xl font-bold ${classes.count}`}>{count}</p>
    </div>
  )
}
