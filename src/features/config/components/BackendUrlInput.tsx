interface BackendUrlInputProps {
  value: string
  onChange: (value: string) => void
}

export function BackendUrlInput({ value, onChange }: BackendUrlInputProps) {
  return (
    <div>
      <label
        htmlFor="backend-url"
        className="block text-sm font-medium text-slate-200 mb-1"
      >
        Backend URL
      </label>
      <input
        id="backend-url"
        type="url"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Your backend URL"
        className="input-8bit placeholder-slate-500"
      />
    </div>
  )
}
