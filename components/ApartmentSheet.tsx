"use client";

import { useState, type ReactNode } from "react";
import { Drawer } from "vaul";
import { updateApartment, deleteApartment, type ApartmentRecord } from "@/lib/db";
import {
  AC_OPTIONS,
  EXPOSURE_OPTIONS,
  LAUNDRY_OPTIONS,
  OUTDOOR_SPACE_OPTIONS,
  UTILITIES_OPTIONS,
  VERDICT_OPTIONS,
  VERDICT_LABELS,
} from "@/lib/apartment-fields";
import { useDebouncedField } from "@/lib/use-debounced-field";
import StarRating from "./StarRating";
import ChipSelect from "./ChipSelect";
import SingleSelect from "./SingleSelect";
import BoolToggle from "./BoolToggle";
import ScaleSelector from "./ScaleSelector";
import NumberStepper from "./NumberStepper";
import PhotoPicker from "./PhotoPicker";

interface ApartmentSheetProps {
  apartmentId: string | null;
  record: ApartmentRecord | undefined;
  onClose: () => void;
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <div className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-500">
        {label}
      </div>
      {children}
    </div>
  );
}

const textFieldClass =
  "w-full rounded-lg border border-zinc-300 bg-white p-3 text-base text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100";

export default function ApartmentSheet({ apartmentId, record, onClose }: ApartmentSheetProps) {
  const [detailsOpen, setDetailsOpen] = useState(false);

  function save(changes: Partial<Omit<ApartmentRecord, "id">>) {
    if (apartmentId) updateApartment(apartmentId, changes);
  }

  const [address, setAddress] = useDebouncedField(record?.address ?? "", (v) =>
    save({ address: v }),
  );
  const [unit, setUnit] = useDebouncedField(record?.unit ?? "", (v) => save({ unit: v }));
  const [notes, setNotes] = useDebouncedField(record?.notes ?? "", (v) => save({ notes: v }));
  const [listingUrl, setListingUrl] = useDebouncedField(record?.listingUrl ?? "", (v) =>
    save({ listingUrl: v }),
  );
  const [agentName, setAgentName] = useDebouncedField(record?.agentName ?? "", (v) =>
    save({ agentName: v }),
  );
  const [agentPhone, setAgentPhone] = useDebouncedField(record?.agentPhone ?? "", (v) =>
    save({ agentPhone: v }),
  );
  const [rentText, setRentText] = useDebouncedField(record?.rent?.toString() ?? "", (v) =>
    save({ rent: v.trim() ? Number(v) : null }),
  );
  const [sqftText, setSqftText] = useDebouncedField(record?.sqft?.toString() ?? "", (v) =>
    save({ sqft: v.trim() ? Number(v) : null }),
  );

  if (!apartmentId) return null;

  async function handleDelete() {
    if (!window.confirm("Delete this apartment? This can't be undone.")) return;
    await deleteApartment(apartmentId!);
    onClose();
  }

  return (
    <Drawer.Root open onOpenChange={(o) => !o && onClose()}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-[1100] bg-black/40" />
        <Drawer.Content className="fixed inset-x-0 bottom-0 z-[1101] flex max-h-[90vh] flex-col rounded-t-2xl bg-white outline-none dark:bg-zinc-900">
          <div className="mx-auto mt-3 h-1.5 w-12 shrink-0 rounded-full bg-zinc-300 dark:bg-zinc-700" />
          <div className="flex-1 overflow-y-auto px-5 pb-8 pt-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <Drawer.Title asChild>
                  <input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Address"
                    className="w-full border-none bg-transparent p-0 text-lg font-semibold text-zinc-900 focus:outline-none dark:text-zinc-50"
                  />
                </Drawer.Title>
                <input
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="Unit (optional)"
                  className="mt-1 w-full border-none bg-transparent p-0 text-sm text-zinc-500 focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={handleDelete}
                aria-label="Delete apartment"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xl text-zinc-400"
              >
                🗑
              </button>
            </div>

            <div className="mt-4">
              <div className="flex flex-wrap gap-2">
                {VERDICT_OPTIONS.map((v) => (
                  <button
                    key={v}
                    type="button"
                    aria-pressed={(record?.verdict ?? "not-toured-yet") === v}
                    onClick={() => save({ verdict: v })}
                    className={`min-h-11 rounded-full border px-3 py-2 text-sm transition-colors ${
                      (record?.verdict ?? "not-toured-yet") === v
                        ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                        : "border-zinc-300 bg-white text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
                    }`}
                  >
                    {VERDICT_LABELS[v]}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <StarRating value={record?.rating ?? 0} onChange={(v) => save({ rating: v })} />
            </div>

            <div className="mt-5 grid grid-cols-2 gap-4">
              <Field label="Rent / mo">
                <input
                  type="number"
                  inputMode="numeric"
                  value={rentText}
                  onChange={(e) => setRentText(e.target.value)}
                  placeholder="$"
                  className={textFieldClass}
                />
              </Field>
              <Field label="Tour date">
                <input
                  type="date"
                  value={record?.tourDate ?? ""}
                  onChange={(e) => save({ tourDate: e.target.value || null })}
                  className={textFieldClass}
                />
              </Field>
              <Field label="Beds">
                <NumberStepper
                  value={record?.beds ?? null}
                  onChange={(v) => save({ beds: v })}
                  step={0.5}
                  min={0}
                />
              </Field>
              <Field label="Baths">
                <NumberStepper
                  value={record?.baths ?? null}
                  onChange={(v) => save({ baths: v })}
                  step={0.5}
                  min={0}
                />
              </Field>
            </div>

            <button
              type="button"
              onClick={() => setDetailsOpen((o) => !o)}
              className="mt-5 min-h-11 w-full rounded-lg border border-zinc-300 py-2 text-sm font-medium text-zinc-700 dark:border-zinc-700 dark:text-zinc-300"
            >
              {detailsOpen ? "Hide details" : "More details"}
            </button>

            {detailsOpen && (
              <div className="mt-4 space-y-5">
                <Field label="Sqft">
                  <input
                    type="number"
                    inputMode="numeric"
                    value={sqftText}
                    onChange={(e) => setSqftText(e.target.value)}
                    className={textFieldClass}
                  />
                </Field>

                <Field label="Floor">
                  <NumberStepper
                    value={record?.floor ?? null}
                    onChange={(v) => save({ floor: v })}
                    min={0}
                  />
                </Field>

                <Field label="Elevator">
                  <BoolToggle
                    value={record?.elevator ?? null}
                    onChange={(v) => save({ elevator: v })}
                  />
                </Field>

                {record?.elevator === false && (
                  <Field label="Walk-up flights">
                    <NumberStepper
                      value={record?.walkupFlights ?? null}
                      onChange={(v) => save({ walkupFlights: v })}
                      min={0}
                    />
                  </Field>
                )}

                <Field label="Laundry">
                  <SingleSelect
                    options={LAUNDRY_OPTIONS}
                    value={record?.laundry ?? null}
                    onChange={(v) => save({ laundry: v })}
                  />
                </Field>

                <Field label="Dishwasher">
                  <BoolToggle
                    value={record?.dishwasher ?? null}
                    onChange={(v) => save({ dishwasher: v })}
                  />
                </Field>

                <Field label="Outdoor space">
                  <SingleSelect
                    options={OUTDOOR_SPACE_OPTIONS}
                    value={record?.outdoorSpace ?? null}
                    onChange={(v) => save({ outdoorSpace: v })}
                  />
                </Field>

                <Field label="Exposure">
                  <ChipSelect
                    options={EXPOSURE_OPTIONS}
                    value={record?.exposure ?? []}
                    onChange={(v) => save({ exposure: v })}
                  />
                </Field>

                <Field label="Natural light">
                  <ScaleSelector
                    value={record?.naturalLight ?? null}
                    onChange={(v) => save({ naturalLight: v })}
                  />
                </Field>

                <Field label="Noise level">
                  <ScaleSelector
                    value={record?.noiseLevel ?? null}
                    onChange={(v) => save({ noiseLevel: v })}
                  />
                </Field>

                <Field label="A/C">
                  <SingleSelect
                    options={AC_OPTIONS}
                    value={record?.ac ?? null}
                    onChange={(v) => save({ ac: v })}
                  />
                </Field>

                <Field label="Pets allowed">
                  <BoolToggle
                    value={record?.petsAllowed ?? null}
                    onChange={(v) => save({ petsAllowed: v })}
                  />
                </Field>

                <Field label="Utilities included">
                  <ChipSelect
                    options={UTILITIES_OPTIONS}
                    value={record?.utilitiesIncluded ?? []}
                    onChange={(v) => save({ utilitiesIncluded: v })}
                  />
                </Field>

                <Field label="Available date">
                  <input
                    type="date"
                    value={record?.availableDate ?? ""}
                    onChange={(e) => save({ availableDate: e.target.value || null })}
                    className={textFieldClass}
                  />
                </Field>

                <Field label="Lease term (months)">
                  <NumberStepper
                    value={record?.leaseTermMonths ?? null}
                    onChange={(v) => save({ leaseTermMonths: v })}
                    min={1}
                  />
                </Field>

                <Field label="Broker fee">
                  <BoolToggle
                    value={record?.brokerFee ?? null}
                    onChange={(v) => save({ brokerFee: v })}
                  />
                </Field>

                <Field label="Listing URL">
                  <input
                    value={listingUrl}
                    onChange={(e) => setListingUrl(e.target.value)}
                    className={textFieldClass}
                  />
                </Field>

                <Field label="Agent name">
                  <input
                    value={agentName}
                    onChange={(e) => setAgentName(e.target.value)}
                    className={textFieldClass}
                  />
                </Field>

                <Field label="Agent phone">
                  <input
                    type="tel"
                    value={agentPhone}
                    onChange={(e) => setAgentPhone(e.target.value)}
                    className={textFieldClass}
                  />
                </Field>

                <Field label="Photos">
                  <PhotoPicker apartmentId={apartmentId} />
                </Field>
              </div>
            )}

            <div className="mt-5">
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-500">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notes..."
                rows={4}
                className="w-full resize-none rounded-lg border border-zinc-300 bg-white p-3 text-base text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              />
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
