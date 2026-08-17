'use client'

import * as React from 'react'
import { ChevronUp, ChevronDown, Trash2, Plus } from 'lucide-react'
import {
  EMAIL_BLOCK_TYPES,
  SMS_BLOCK_TYPES,
  EMAIL_BLOCK_LABELS,
  SMS_BLOCK_LABELS,
  LINK_TARGET_LABELS,
  createEmailBlock,
  createSmsBlock,
} from '@/lib/documents/types'
import type {
  EmailBlock,
  LinkTarget,
  MessageDocument,
  SmsBlock,
} from '@/lib/documents/types'

const TOKEN_HINT =
  '{{firstName}} {{service}} {{serviceDetail}} {{schedule}} {{total}} {{deposit}} {{balance}} {{address}}'
const inputClass =
  'w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 placeholder:text-slate-500 focus:border-[#4A7C59]/40 focus:outline-none transition-colors duration-200'
const iconBtnClass =
  'flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 transition-colors duration-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer'

function FieldRow({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
        {label}
      </label>
      {children}
    </div>
  )
}

export function BlockEditor({
  document: doc,
  onChange,
  subjectEditable = true,
}: {
  document: MessageDocument
  onChange: (next: MessageDocument) => void
  subjectEditable?: boolean
}) {
  const isEmail = doc.channel === 'email'
  const [addType, setAddType] = React.useState<string>(
    isEmail ? 'paragraph' : 'textLine'
  )
  React.useEffect(
    () => setAddType(isEmail ? 'paragraph' : 'textLine'),
    [isEmail]
  )

  const setBlocks = (blocks: MessageDocument['blocks']) =>
    onChange({ ...doc, blocks } as MessageDocument)
  const patch = (index: number, changes: Record<string, unknown>) =>
    setBlocks(
      doc.blocks.map((b, i) =>
        i === index ? { ...b, ...changes } : b
      ) as MessageDocument['blocks']
    )
  const move = (index: number, delta: number) => {
    const target = index + delta
    if (target < 0 || target >= doc.blocks.length) return
    const next = [...doc.blocks]
    const [item] = next.splice(index, 1)
    next.splice(target, 0, item)
    setBlocks(next as MessageDocument['blocks'])
  }
  const remove = (index: number) =>
    setBlocks(
      doc.blocks.filter((_, i) => i !== index) as MessageDocument['blocks']
    )
  const add = () => {
    const block = isEmail
      ? createEmailBlock(addType as EmailBlock['type'])
      : createSmsBlock(addType as SmsBlock['type'])
    setBlocks([...doc.blocks, block] as MessageDocument['blocks'])
  }

  const renderFields = (block: EmailBlock | SmsBlock, index: number) => {
    switch (block.type) {
      case 'divider':
      case 'blankLine':
        return null
      case 'badge':
        return (
          <div className="space-y-2">
            <FieldRow label="Text">
              <input
                className={inputClass}
                value={block.text}
                onChange={(e) => patch(index, { text: e.target.value })}
              />
            </FieldRow>
            <FieldRow label="Color">
              <select
                className={`${inputClass} cursor-pointer`}
                value={block.color}
                onChange={(e) => patch(index, { color: e.target.value })}
              >
                <option value="green">Green</option>
                <option value="amber">Amber</option>
                <option value="blue">Blue</option>
                <option value="navy">Navy</option>
              </select>
            </FieldRow>
          </div>
        )
      case 'heading':
      case 'textLine':
        return (
          <FieldRow label="Text">
            <input
              className={inputClass}
              value={block.text}
              onChange={(e) => patch(index, { text: e.target.value })}
            />
          </FieldRow>
        )
      case 'paragraph':
        return (
          <FieldRow label="Text">
            <textarea
              className={`${inputClass} resize-none leading-relaxed`}
              rows={4}
              value={block.text}
              onChange={(e) => patch(index, { text: e.target.value })}
            />
          </FieldRow>
        )
      case 'scheduleCard':
        return (
          <div className="space-y-2">
            <FieldRow label="Header — before a date is set">
              <input
                className={inputClass}
                value={block.header}
                onChange={(e) => patch(index, { header: e.target.value })}
              />
            </FieldRow>
            <FieldRow label="Badge — before a date is set">
              <input
                className={inputClass}
                value={block.pill ?? ''}
                onChange={(e) => patch(index, { pill: e.target.value })}
              />
            </FieldRow>
            <FieldRow label="Header — once the date is confirmed">
              <input
                className={inputClass}
                value={block.headerConfirmed ?? ''}
                onChange={(e) =>
                  patch(index, { headerConfirmed: e.target.value })
                }
              />
            </FieldRow>
            <FieldRow label="Badge — once confirmed (blank for none)">
              <input
                className={inputClass}
                value={block.pillConfirmed ?? ''}
                onChange={(e) =>
                  patch(index, { pillConfirmed: e.target.value })
                }
              />
            </FieldRow>
            <p className="text-[10px] text-slate-500">
              The date, time window, and address come from the job.
            </p>
          </div>
        )
      case 'detailsCard':
        return (
          <div className="space-y-2">
            <FieldRow label="Header">
              <input
                className={inputClass}
                value={block.header}
                onChange={(e) => patch(index, { header: e.target.value })}
              />
            </FieldRow>
            <p className="text-[10px] text-slate-500">
              Service, bed/bath, and add-ons come from the job.
            </p>
          </div>
        )
      case 'invoiceTable':
        return (
          <div className="space-y-2">
            <FieldRow label="Header">
              <input
                className={inputClass}
                value={block.header}
                onChange={(e) => patch(index, { header: e.target.value })}
              />
            </FieldRow>
            <FieldRow label="Subtotal label">
              <input
                className={inputClass}
                value={block.subtotalLabel ?? ''}
                onChange={(e) =>
                  patch(index, { subtotalLabel: e.target.value })
                }
              />
            </FieldRow>
            <FieldRow label="Deposit label">
              <input
                className={inputClass}
                value={block.depositLabel ?? ''}
                onChange={(e) => patch(index, { depositLabel: e.target.value })}
              />
            </FieldRow>
            <FieldRow label="Amount due label">
              <input
                className={inputClass}
                value={block.dueLabel ?? ''}
                onChange={(e) => patch(index, { dueLabel: e.target.value })}
              />
            </FieldRow>
            <p className="text-[10px] text-slate-500">
              Line items, amounts, and totals come from the invoice panel.
            </p>
          </div>
        )
      case 'paymentCard':
        return (
          <div className="space-y-2">
            <FieldRow label="Header">
              <input
                className={inputClass}
                value={block.header}
                onChange={(e) => patch(index, { header: e.target.value })}
              />
            </FieldRow>
            <FieldRow label="Total label">
              <input
                className={inputClass}
                value={block.totalLabel}
                onChange={(e) => patch(index, { totalLabel: e.target.value })}
              />
            </FieldRow>
            <div className="grid grid-cols-2 gap-2">
              <FieldRow label="Due label">
                <input
                  className={inputClass}
                  value={block.dueLabel}
                  onChange={(e) => patch(index, { dueLabel: e.target.value })}
                />
              </FieldRow>
              <FieldRow label="Due note">
                <input
                  className={inputClass}
                  value={block.dueNote}
                  onChange={(e) => patch(index, { dueNote: e.target.value })}
                />
              </FieldRow>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <FieldRow label="Balance label">
                <input
                  className={inputClass}
                  value={block.balanceLabel}
                  onChange={(e) =>
                    patch(index, { balanceLabel: e.target.value })
                  }
                />
              </FieldRow>
              <FieldRow label="Balance note">
                <input
                  className={inputClass}
                  value={block.balanceNote}
                  onChange={(e) =>
                    patch(index, { balanceNote: e.target.value })
                  }
                />
              </FieldRow>
            </div>
            <FieldRow label="Disclaimer (blank to hide)">
              <textarea
                className={`${inputClass} resize-none leading-relaxed`}
                rows={3}
                value={block.disclaimer}
                onChange={(e) => patch(index, { disclaimer: e.target.value })}
              />
            </FieldRow>
            <p className="text-[10px] text-slate-500">
              Amounts come from the job. You edit the labels only.
            </p>
          </div>
        )
      case 'bulletList':
      case 'numberedSteps':
        return (
          <div className="space-y-2">
            <FieldRow label="Header">
              <input
                className={inputClass}
                value={block.header}
                onChange={(e) => patch(index, { header: e.target.value })}
              />
            </FieldRow>
            <div className="space-y-1.5">
              {block.lines.map((line, li) => (
                <div key={li} className="flex items-center gap-1.5">
                  <input
                    className={inputClass}
                    value={line}
                    onChange={(e) => {
                      const lines = [...block.lines]
                      lines[li] = e.target.value
                      patch(index, { lines })
                    }}
                  />
                  <button
                    type="button"
                    aria-label="Remove line"
                    className={iconBtnClass}
                    onClick={() =>
                      patch(index, {
                        lines: block.lines.filter((_, i) => i !== li),
                      })
                    }
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="text-[11px] font-medium text-[#4A7C59] transition-colors duration-200 hover:text-[#3d6b4a] cursor-pointer"
                onClick={() => patch(index, { lines: [...block.lines, ''] })}
              >
                Add line
              </button>
            </div>
          </div>
        )
      case 'button':
      case 'linkLine':
        return (
          <div className="space-y-2">
            {block.type === 'button' && (
              <FieldRow label="Button label">
                <input
                  className={inputClass}
                  value={block.label}
                  onChange={(e) => patch(index, { label: e.target.value })}
                />
              </FieldRow>
            )}
            <FieldRow label="Links to">
              <select
                className={`${inputClass} cursor-pointer`}
                value={block.target}
                onChange={(e) =>
                  patch(index, { target: e.target.value as LinkTarget })
                }
              >
                {(Object.keys(LINK_TARGET_LABELS) as LinkTarget[]).map((t) => (
                  <option key={t} value={t}>
                    {LINK_TARGET_LABELS[t]}
                  </option>
                ))}
              </select>
            </FieldRow>
            {block.target === 'custom' && (
              <FieldRow label="URL">
                <input
                  className={inputClass}
                  value={block.url ?? ''}
                  placeholder="https://"
                  onChange={(e) => patch(index, { url: e.target.value })}
                />
              </FieldRow>
            )}
          </div>
        )
    }
  }

  const types = isEmail ? EMAIL_BLOCK_TYPES : SMS_BLOCK_TYPES
  const labelFor = (type: string) =>
    isEmail
      ? EMAIL_BLOCK_LABELS[type as EmailBlock['type']]
      : SMS_BLOCK_LABELS[type as SmsBlock['type']]
  return (
    <div className="space-y-2">
      {isEmail && subjectEditable && (
        <div className="rounded-lg border border-slate-200 bg-white p-2.5">
          <FieldRow label="Subject">
            <input
              className={inputClass}
              value={doc.subject ?? ''}
              onChange={(e) =>
                onChange({ ...doc, subject: e.target.value } as MessageDocument)
              }
            />
          </FieldRow>
        </div>
      )}
      {doc.blocks.map((block, index) => (
        <div
          key={block.id}
          className="rounded-lg border border-slate-200 bg-white p-2.5"
        >
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
              {labelFor(block.type)}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label="Move up"
                className={iconBtnClass}
                disabled={index === 0}
                onClick={() => move(index, -1)}
              >
                <ChevronUp size={13} />
              </button>
              <button
                type="button"
                aria-label="Move down"
                className={iconBtnClass}
                disabled={index === doc.blocks.length - 1}
                onClick={() => move(index, 1)}
              >
                <ChevronDown size={13} />
              </button>
              <button
                type="button"
                aria-label="Delete block"
                className={iconBtnClass}
                onClick={() => remove(index)}
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
          {renderFields(block, index)}
        </div>
      ))}
      <div className="flex items-center gap-2">
        <select
          className={`${inputClass} cursor-pointer`}
          value={addType}
          onChange={(e) => setAddType(e.target.value)}
        >
          {types.map((t) => (
            <option key={t} value={t}>
              {labelFor(t)}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={add}
          className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-900 transition-colors duration-200 hover:bg-slate-50 cursor-pointer"
        >
          <Plus size={13} /> Add block
        </button>
      </div>
      <p className="text-[10px] leading-relaxed text-slate-500">
        Tokens: {TOKEN_HINT}
      </p>
    </div>
  )
}
