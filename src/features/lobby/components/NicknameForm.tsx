interface NicknameFormProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  isSubmitting: boolean
  disabled: boolean
}

export function NicknameForm({
  value,
  onChange,
  onSubmit,
  isSubmitting,
  disabled,
}: NicknameFormProps) {
  return (
    <div className="w-full space-y-4">
      <label
        htmlFor="nickname"
        className="block text-sm font-medium text-slate-200"
      >
        Nickname
      </label>
      <input
        id="nickname"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter your nickname"
        maxLength={30}
        className="input-8bit placeholder-slate-400"
      />
      <button
        type="button"
        onClick={onSubmit}
        disabled={disabled || !value.trim() || isSubmitting}
        className="btn-base w-full py-2 px-4 bg-amber-500 text-slate-900 font-medium hover:bg-amber-400"
      >
        {isSubmitting ? 'Joining…' : 'Join'}
      </button>
    </div>
  )
}
