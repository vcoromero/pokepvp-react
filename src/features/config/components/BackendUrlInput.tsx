interface BackendUrlInputProps {
  value: string
  onChange: (value: string) => void
}

export function BackendUrlInput({ value, onChange }: BackendUrlInputProps) {
  return (
    <div>
      <label
        htmlFor="backend-url"
        className="block text-sm font-medium text-slate-300 mb-1"
      >
        Backend URL
      </label>
      <input
        id="backend-url"
        type="url"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Your backend URL"
        className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
      />
    </div>
  )
}
