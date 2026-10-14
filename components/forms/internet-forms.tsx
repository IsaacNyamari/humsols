"use client";

import { useState } from "react";
import { Icon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { a11y, Field, FormError, Input, Select, Textarea } from "@/components/ui/form";
import type { PackageDTO } from "@/lib/types";
import { formatKes } from "@/lib/utils";
import {
  ConsentField,
  ContactFields,
  formBase,
  Honeypot,
  SubmitButton,
  SuccessPanel,
} from "./shared";
import { str, useLeadForm } from "./use-lead-form";

export function CoverageForm() {
  const { status, errors, formError, reference, submit, reset } = useLeadForm("internet_coverage");
  const [coords, setCoords] = useState<{ lat: number; lng: number }>();
  const [geoMsg, setGeoMsg] = useState<string>();

  function locate() {
    if (!navigator.geolocation)
      return setGeoMsg("Location isn't available in this browser — type your address instead.");
    setGeoMsg("Finding your location…");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lat: Number(pos.coords.latitude.toFixed(6)),
          lng: Number(pos.coords.longitude.toFixed(6)),
        });
        setGeoMsg("Location pinned.");
      },
      () => setGeoMsg("We couldn't get your location — type your address instead."),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  if (status === "success" && reference)
    return <SuccessPanel reference={reference} title="Coverage check requested" onReset={reset} />;

  return (
    <form
      noValidate
      className="relative space-y-5"
      data-testid="coverage-form"
      onSubmit={async (e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        await submit({
          ...formBase(fd),
          message: str(fd, "message"),
          details: {
            area: str(fd, "area"),
            address: str(fd, "address"),
            audience: str(fd, "audience") || "home",
            ...coords,
          },
        });
      }}
    >
      <FormError message={formError} />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          id="cov--area"
          label="Estate or area"
          required
          error={errors["details.area"]}
          hint="e.g. Kileleshwa, Ruaka, Syokimau"
        >
          <Input {...a11y("cov--area", errors["details.area"], true)} required />
        </Field>
        <Field id="cov--audience" label="Internet for" required error={errors["details.audience"]}>
          <Select {...a11y("cov--audience", errors["details.audience"])} defaultValue="home">
            <option value="home">Home</option>
            <option value="business">Business</option>
          </Select>
        </Field>
      </div>
      <Field id="cov--address" label="Address or landmark" error={errors["details.address"]}>
        <Input {...a11y("cov--address", errors["details.address"])} autoComplete="street-address" />
      </Field>
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline" size="sm" onClick={locate}>
          <Icon name="location" className="size-4" /> Use my current location
        </Button>
        <span className="text-sm text-muted" aria-live="polite">
          {coords ? `${geoMsg} (${coords.lat}, ${coords.lng})` : geoMsg}
        </span>
      </div>
      <ContactFields errors={errors} showCompany={false} prefix="cov" />
      <Honeypot prefix="cov" />
      <ConsentField error={errors.consent} prefix="cov" />
      <SubmitButton submitting={status === "submitting"}>Check coverage</SubmitButton>
    </form>
  );
}

export function InstallationForm({
  packages,
  initialPackageId,
}: {
  packages: PackageDTO[];
  initialPackageId?: string;
}) {
  const { status, errors, formError, reference, submit, reset } =
    useLeadForm("internet_installation");
  const initial = packages.find((p) => p.id === initialPackageId);

  if (status === "success" && reference)
    return (
      <SuccessPanel reference={reference} title="Installation request received" onReset={reset} />
    );

  return (
    <form
      noValidate
      className="relative space-y-5"
      onSubmit={async (e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const pkg = packages.find((p) => p.id === str(fd, "packageId"));
        await submit({
          ...formBase(fd),
          message: str(fd, "message"),
          details: {
            packageId: pkg?.id,
            packageName: pkg ? `${pkg.name} — ${pkg.speedMbps} Mbps` : undefined,
            audience: pkg?.audience ?? (str(fd, "audience") || "home"),
            area: str(fd, "area"),
            address: str(fd, "address"),
            preferredDate: str(fd, "preferredDate"),
          },
        });
      }}
    >
      <FormError message={formError} />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="inst--packageId" label="Package" error={errors["details.packageId"]}>
          <Select
            {...a11y("inst--packageId", errors["details.packageId"])}
            defaultValue={initial?.id ?? ""}
          >
            <option value="">Not sure yet — advise me</option>
            {packages.map((p) => (
              <option key={p.id} value={p.id}>
                {p.audience === "home" ? "Home" : "Business"} ·{" "}
                {p.name.replace(/\s*\[PLACEHOLDER[^\]]*\]/g, "")} · {p.speedMbps} Mbps ·{" "}
                {formatKes(p.priceKes)}/mo
              </option>
            ))}
          </Select>
        </Field>
        <Field id="inst--audience" label="Installation for" error={errors["details.audience"]}>
          <Select
            {...a11y("inst--audience", errors["details.audience"])}
            defaultValue={initial?.audience ?? "home"}
          >
            <option value="home">Home</option>
            <option value="business">Business</option>
          </Select>
        </Field>
        <Field id="inst--area" label="Estate or area" required error={errors["details.area"]}>
          <Input {...a11y("inst--area", errors["details.area"])} required />
        </Field>
        <Field
          id="inst--preferredDate"
          label="Preferred installation date"
          error={errors["details.preferredDate"]}
        >
          <Input {...a11y("inst--preferredDate", errors["details.preferredDate"])} type="date" />
        </Field>
      </div>
      <Field
        id="inst--address"
        label="Installation address"
        required
        error={errors["details.address"]}
        hint="Building, floor/house number and a landmark"
      >
        <Input {...a11y("inst--address", errors["details.address"], true)} required />
      </Field>
      <ContactFields errors={errors} prefix="inst" />
      <Field id="inst--message" label="Anything else?" error={errors.message}>
        <Textarea {...a11y("inst--message", errors.message)} rows={3} />
      </Field>
      <Honeypot prefix="inst" />
      <ConsentField error={errors.consent} prefix="inst" />
      <SubmitButton submitting={status === "submitting"}>Request installation</SubmitButton>
    </form>
  );
}
