interface ConfigMessageProps {
  message: string
  success: boolean
}

export function ConfigMessage({ message, success }: ConfigMessageProps) {
  return (
    <p className={`text-sm ${success ? 'text-green-400' : 'text-red-400'}`}>
      {message}
    </p>
  )
}
