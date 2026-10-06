"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus, Trash2, Pencil, Check, ChevronDown, ChevronUp, Users, Trophy, ToggleLeft, ToggleRight, Loader2 } from "lucide-react"
import { api } from "@/lib/api"
import { cn, formatDate } from "@/lib/utils"
import type { NominationPosition } from "@/types"

export default function AdminNominationsPage() {
  const qc = useQueryClient()
  const [tab, setTab] = useState<"positions" | "results">("positions")
  const [expanded, setExpanded] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [newDesc, setNewDesc] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editDesc, setEditDesc] = useState("")

  const positionsQ = useQuery({ queryKey: ["admin-nominations-positions"], queryFn: api.nominations.positions })
  const resultsQ = useQuery({ queryKey: ["admin-nominations-results"], queryFn: api.nominations.results, enabled: tab === "results" })

  const createMut = useMutation({
    mutationFn: api.nominations.createPosition,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-nominations-positions"] }); setAdding(false); setNewTitle(""); setNewDesc("") },
  })

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof api.nominations.updatePosition>[1] }) =>
      api.nominations.updatePosition(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-nominations-positions"] }); setEditingId(null) },
  })

  const deleteMut = useMutation({
    mutationFn: api.nominations.removePosition,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-nominations-positions"] }),
  })

  const deleteNomMut = useMutation({
    mutationFn: api.nominations.removeNomination,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-nominations-results"] }),
  })

  const positions = positionsQ.data ?? []
  const results = resultsQ.data ?? []

  function startEdit(pos: NominationPosition) {
    setEditingId(pos.id)
    setEditTitle(pos.title)
    setEditDesc(pos.description ?? "")
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Nominations</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Manage leadership positions and view results</p>
        </div>
        <a
          href="/nominations"
          target="_blank"
          className="px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors"
        >
          View Public Form ↗
        </a>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-muted rounded-xl w-fit">
        {(["positions", "results"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors",
              tab === t ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Positions tab */}
      {tab === "positions" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{positions.length} position{positions.length !== 1 ? "s" : ""}</p>
            <button
              onClick={() => setAdding(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Position
            </button>
          </div>

          {/* Add form */}
          {adding && (
            <div className="bg-card border border-primary/30 rounded-2xl p-5 space-y-3">
              <p className="font-semibold text-sm">New Position</p>
              <input
                autoFocus
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Position title (e.g. President)"
                className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <input
                type="text"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Short description (optional)"
                className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <div className="flex gap-2">
                <button
                  disabled={!newTitle.trim() || createMut.isPending}
                  onClick={() => createMut.mutate({ title: newTitle.trim(), description: newDesc.trim() || undefined, order: positions.length })}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-50"
                >
                  {createMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Save
                </button>
                <button onClick={() => { setAdding(false); setNewTitle(""); setNewDesc("") }} className="px-4 py-2 rounded-xl border border-border text-sm">
                  Cancel
                </button>
              </div>
            </div>
          )}

          {positionsQ.isLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground py-8 justify-center">
              <Loader2 className="w-5 h-5 animate-spin" /> Loading…
            </div>
          ) : positions.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-border rounded-2xl text-muted-foreground">
              <p className="font-medium">No positions yet.</p>
              <p className="text-sm">Add positions that members can nominate for.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {positions.map((pos, i) => (
                <div key={pos.id} className="bg-card border border-border rounded-2xl overflow-hidden">
                  {editingId === pos.id ? (
                    <div className="p-4 space-y-3">
                      <input
                        autoFocus
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring font-semibold"
                      />
                      <input
                        type="text"
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                        placeholder="Description (optional)"
                        className="w-full px-3 py-2 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                      <div className="flex gap-2">
                        <button
                          disabled={updateMut.isPending}
                          onClick={() => updateMut.mutate({ id: pos.id, data: { title: editTitle.trim(), description: editDesc.trim() || undefined } })}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold disabled:opacity-50"
                        >
                          {updateMut.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />} Save
                        </button>
                        <button onClick={() => setEditingId(null)} className="px-3 py-1.5 rounded-lg border border-border text-xs">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-4">
                      <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-bold shrink-0">
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm">{pos.title}</p>
                        {pos.description && <p className="text-muted-foreground text-xs truncate">{pos.description}</p>}
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">
                        <Users className="w-3 h-3 inline mr-1" />{pos._count?.nominations ?? 0}
                      </span>
                      {/* Toggle active */}
                      <button
                        onClick={() => updateMut.mutate({ id: pos.id, data: { active: !pos.active } })}
                        title={pos.active ? "Close nominations for this position" : "Open nominations for this position"}
                        aria-label={pos.active ? `Close ${pos.title}` : `Open ${pos.title}`}
                        className={cn("shrink-0 transition-colors", pos.active ? "text-emerald-500" : "text-muted-foreground")}
                      >
                        {pos.active ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                      </button>
                      <button
                        onClick={() => startEdit(pos)}
                        aria-label={`Edit ${pos.title}`}
                        className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => { if (confirm(`Delete "${pos.title}" and all its nominations?`)) deleteMut.mutate(pos.id) }}
                        aria-label={`Delete ${pos.title}`}
                        className="text-muted-foreground hover:text-red-500 transition-colors shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Results tab */}
      {tab === "results" && (
        <div className="space-y-4">
          {resultsQ.isLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground py-8 justify-center">
              <Loader2 className="w-5 h-5 animate-spin" /> Loading results…
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-border rounded-2xl text-muted-foreground">
              No results yet. Add positions and share the nomination link.
            </div>
          ) : (
            results.map((result) => (
              <div key={result.id} className="bg-card border border-border rounded-2xl overflow-hidden">
                {/* Position header */}
                <button
                  className="w-full flex items-center gap-3 p-5 text-left hover:bg-muted/30 transition-colors"
                  onClick={() => setExpanded(expanded === result.id ? null : result.id)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-bold">{result.title}</p>
                    {result.description && <p className="text-muted-foreground text-xs">{result.description}</p>}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm text-muted-foreground">
                      <Users className="w-3.5 h-3.5 inline mr-1" />{result.totalNominations} nomination{result.totalNominations !== 1 ? "s" : ""}
                    </span>
                    {expanded === result.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {expanded === result.id && (
                  <div className="border-t border-border">
                    {/* Tally (ranked) */}
                    {result.tally.length > 0 && (
                      <div className="p-5 border-b border-border">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-4">Vote Tally</p>
                        <div className="space-y-2">
                          {result.tally.map((t, i) => {
                            const max = result.tally[0]?.count ?? 1
                            const pct = Math.round((t.count / max) * 100)
                            return (
                              <div key={t.name} className="flex items-center gap-3">
                                <span className="text-xs w-5 text-right font-bold text-muted-foreground">{i + 1}</span>
                                {i === 0 && <Trophy className="w-3.5 h-3.5 text-gold shrink-0" />}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-baseline justify-between mb-1">
                                    <span className="font-semibold text-sm capitalize">{t.name}</span>
                                    <span className="text-xs text-muted-foreground">{t.count} vote{t.count !== 1 ? "s" : ""}</span>
                                  </div>
                                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                    <div
                                      className={cn("h-full rounded-full transition-all", i === 0 ? "bg-primary" : "bg-muted-foreground/30")}
                                      style={{ width: `${pct}%` }}
                                    />
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* Individual nominations */}
                    <div className="p-5">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-4">All Submissions</p>
                      {result.nominations.length === 0 ? (
                        <p className="text-muted-foreground text-sm">No nominations yet.</p>
                      ) : (
                        <div className="space-y-2">
                          {result.nominations.map((nom) => (
                            <div key={nom.id} className="flex items-center justify-between gap-3 text-sm py-2 border-b border-border/50 last:border-0">
                              <div className="min-w-0">
                                <span className="font-semibold">{nom.nomineeName}</span>
                                {nom.nomineeInfo && <span className="text-muted-foreground text-xs ml-2">({nom.nomineeInfo})</span>}
                                <div className="text-muted-foreground text-xs mt-0.5">
                                  By {nom.nominatorName} · {nom.nominatorId} · {formatDate(nom.createdAt)}
                                </div>
                              </div>
                              <button
                                onClick={() => { if (confirm("Delete this nomination?")) deleteNomMut.mutate(nom.id) }}
                                className="text-muted-foreground hover:text-red-500 transition-colors shrink-0"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
