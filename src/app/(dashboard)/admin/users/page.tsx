"use client"

import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { KeyRound, Plus, Trash2, UserCheck, UserX } from "lucide-react"
import {
  Dialog,
  ErrorBanner,
  LoadingState,
  PrimaryButton,
  SelectField,
  TextField,
} from "@/components/dashboard/form-fields"
import { api, type NewStaffUser } from "@/lib/api"
import { useSession } from "@/lib/session"
import { cn } from "@/lib/utils"
import type { Role, StaffUser } from "@/types"

const roleLabels: Record<Role, string> = {
  ADMIN: "Admin",
  CHURCH_EDITOR: "Church Editor",
  MEDICAL_MINISTER: "Medical Minister",
}

const roleColors: Record<Role, string> = {
  ADMIN: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  CHURCH_EDITOR: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  MEDICAL_MINISTER: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
}

const roleOptions = (Object.keys(roleLabels) as Role[]).map((role) => ({ value: role, label: roleLabels[role] }))

const USERS = ["users"]

/** The parts of an account an admin can change from the list. */
type AccessChange = Partial<Pick<StaffUser, "role" | "verified" | "active">>

// There is no sign-up page: every staff account is created here by an admin.
export default function UsersPage() {
  const queryClient = useQueryClient()
  const session = useSession()
  const [creating, setCreating] = useState(false)
  const [resetting, setResetting] = useState<StaffUser | null>(null)
  const [error, setError] = useState("")

  const { data: users = [], isLoading, error: loadError } = useQuery({ queryKey: USERS, queryFn: api.users.list })

  const refresh = () => queryClient.invalidateQueries({ queryKey: USERS })
  const showError = (e: Error) => setError(e.message)

  const update = useMutation({
    mutationFn: ({ id, change }: { id: string; change: AccessChange }) => api.users.update(id, change),
    onSuccess: refresh,
    onError: showError,
  })
  const remove = useMutation({ mutationFn: api.users.remove, onSuccess: refresh, onError: showError })

  function confirmRemove(user: StaffUser) {
    if (confirm(`Delete ${user.name}? This cannot be undone.`)) {
      setError("")
      remove.mutate(user.id)
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Create staff accounts and manage their access. There is no self-registration.
          </p>
        </div>
        <PrimaryButton onClick={() => setCreating(true)}>
          <Plus className="w-4 h-4" /> New User
        </PrimaryButton>
      </div>

      <ErrorBanner message={error || loadError?.message} className="mb-6" />

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {isLoading ? (
          <LoadingState label="Loading users…" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-left text-muted-foreground">
                  <th className="px-5 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold hidden sm:table-cell">Email</th>
                  <th className="px-4 py-3 font-semibold">Role</th>
                  <th className="px-4 py-3 font-semibold">Verified</th>
                  <th className="px-4 py-3 font-semibold">Access</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <UserRow
                    key={user.id}
                    user={user}
                    isSelf={user.id === session?.id}
                    busy={update.isPending || remove.isPending}
                    onChange={(change) => {
                      setError("")
                      update.mutate({ id: user.id, change })
                    }}
                    onResetPassword={() => setResetting(user)}
                    onDelete={() => confirmRemove(user)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {creating && (
        <CreateUserDialog
          onClose={() => setCreating(false)}
          onCreated={() => {
            setCreating(false)
            refresh()
          }}
        />
      )}
      {resetting && <ResetPasswordDialog user={resetting} onClose={() => setResetting(null)} />}
    </div>
  )
}

interface UserRowProps {
  user: StaffUser
  /** The row for the admin who is looking at the page */
  isSelf: boolean
  /** A change is being saved; controls are disabled until it finishes */
  busy: boolean
  onChange: (change: AccessChange) => void
  onResetPassword: () => void
  onDelete: () => void
}

function UserRow({ user, isSelf, busy, onChange, onResetPassword, onDelete }: UserRowProps) {
  // Nobody can change their own role or access, so an admin cannot lock
  // themselves out. Another admin has to do it.
  const locked = busy || isSelf
  const ownAccount = "Another admin has to change this for your own account"

  return (
    <tr className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
      <td className="px-5 py-3.5">
        <p className="font-medium text-foreground">
          {user.name}
          {isSelf && <span className="text-muted-foreground font-normal"> (you)</span>}
        </p>
        <p className="text-muted-foreground text-xs sm:hidden truncate">{user.email}</p>
      </td>
      <td className="px-4 py-3.5 text-muted-foreground hidden sm:table-cell">{user.email}</td>

      <td className="px-4 py-3.5">
        {isSelf ? (
          <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap", roleColors[user.role])}>
            {roleLabels[user.role]}
          </span>
        ) : (
          <select
            value={user.role}
            onChange={(e) => onChange({ role: e.target.value as Role })}
            disabled={busy}
            aria-label={`Role of ${user.name}`}
            title="Change role"
            className={cn("text-xs font-semibold pl-2 pr-1 py-1 rounded-full cursor-pointer", roleColors[user.role])}
          >
            {roleOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )}
      </td>

      <td className="px-4 py-3.5">
        <button
          onClick={() => onChange({ verified: !user.verified })}
          disabled={locked}
          title={isSelf ? ownAccount : user.verified ? "Click to mark as pending" : "Click to verify"}
          className={cn(
            "inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full transition-colors disabled:cursor-not-allowed",
            user.verified
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 enabled:hover:bg-emerald-200"
              : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 enabled:hover:bg-amber-200"
          )}
        >
          {user.verified ? <UserCheck className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
          {user.verified ? "Verified" : "Pending"}
        </button>
      </td>

      <td className="px-4 py-3.5">
        <button
          onClick={() => onChange({ active: !user.active })}
          disabled={locked}
          title={isSelf ? ownAccount : user.active ? "Click to suspend" : "Click to restore access"}
          className={cn(
            "text-xs font-semibold px-2.5 py-1 rounded-full transition-colors disabled:cursor-not-allowed",
            user.active
              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 enabled:hover:bg-blue-200"
              : "bg-muted text-muted-foreground enabled:hover:bg-muted/80"
          )}
        >
          {user.active ? "Active" : "Suspended"}
        </button>
      </td>

      <td className="px-4 py-3.5">
        <div className="flex items-center gap-1 justify-end">
          <button
            onClick={onResetPassword}
            aria-label={`Reset password for ${user.name}`}
            title="Reset password"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <KeyRound className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onDelete}
            disabled={locked}
            aria-label={`Delete ${user.name}`}
            title={isSelf ? "You cannot delete your own account" : "Delete user"}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground enabled:hover:text-red-500 enabled:hover:bg-red-50 dark:enabled:hover:bg-red-900/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  )
}

function DialogButtons({ onCancel, busy, action }: { onCancel: () => void; busy: boolean; action: string }) {
  return (
    <div className="flex gap-3 pt-2">
      <button
        type="button"
        onClick={onCancel}
        className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors"
      >
        Cancel
      </button>
      <PrimaryButton type="submit" busy={busy} className="flex-1">
        {action}
      </PrimaryButton>
    </div>
  )
}

function CreateUserDialog({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState<NewStaffUser>({ name: "", email: "", password: "", role: "CHURCH_EDITOR" })
  const [error, setError] = useState("")

  const create = useMutation({
    mutationFn: () => api.users.create(form),
    onSuccess: onCreated,
    onError: (e: Error) => setError(e.message),
  })

  const set = (field: "name" | "email" | "password") => (value: string) =>
    setForm((current) => ({ ...current, [field]: value }))

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) {
      setError("All fields are required.")
      return
    }
    setError("")
    create.mutate()
  }

  return (
    <Dialog title="Create New User" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <ErrorBanner message={error} />
        <TextField label="Full name" value={form.name} onChange={set("name")} />
        <TextField label="Email address" type="email" value={form.email} onChange={set("email")} />
        <TextField
          label="Password"
          type="password"
          value={form.password}
          onChange={set("password")}
          hint="At least 8 characters. Pass it on to the new user yourself."
        />
        <SelectField
          label="Role"
          value={form.role}
          onChange={(role) => setForm((current) => ({ ...current, role: role as Role }))}
          options={roleOptions}
        />
        <DialogButtons onCancel={onClose} busy={create.isPending} action="Create User" />
      </form>
    </Dialog>
  )
}

function ResetPasswordDialog({ user, onClose }: { user: StaffUser; onClose: () => void }) {
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const reset = useMutation({
    mutationFn: () => api.users.resetPassword(user.id, password),
    onSuccess: onClose,
    onError: (e: Error) => setError(e.message),
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 8) {
      setError("The password must be at least 8 characters.")
      return
    }
    setError("")
    reset.mutate()
  }

  return (
    <Dialog title={`Reset Password — ${user.name}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <ErrorBanner message={error} />
        <TextField
          label="New password"
          type="password"
          value={password}
          onChange={setPassword}
          hint="At least 8 characters."
        />
        <DialogButtons onCancel={onClose} busy={reset.isPending} action="Reset Password" />
      </form>
    </Dialog>
  )
}
