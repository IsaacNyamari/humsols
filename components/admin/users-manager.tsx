"use client";

import { useState, useTransition } from "react";
import { changeRoleAction, inviteUserAction, setActiveAction } from "@/app/admin/actions/users";
import { Icon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/card";
import { Field, FormError, Input, Select } from "@/components/ui/form";
import { Modal } from "@/components/ui/modal";
import { Table, Td, Th } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import { ROLES, type Role } from "@/lib/constants";
import { canManageRole } from "@/lib/permissions";
import type { UserDTO } from "@/lib/services/users";
import { formatDate } from "@/lib/utils";

const ROLE_HELP: Record<Role, string> = {
  owner: "Everything, including managing owners",
  admin: "Everything except managing owners",
  editor: "Website content only",
  sales: "Leads only",
};

export function UsersManager({ users, me }: { users: UserDTO[]; me: { id: string; role: Role } }) {
  const toast = useToast();
  const [pending, start] = useTransition();
  const [inviteOpen, setInviteOpen] = useState(false);
  const assignable = ROLES.filter((r) => canManageRole(me.role, r));

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>, success: string) =>
    start(async () => {
      const r = await fn();
      toast(r.ok ? success : (r.error ?? "Failed"), r.ok ? "success" : "error");
    });

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button size="sm" onClick={() => setInviteOpen(true)}>
          <Icon name="plus" className="size-4" /> Invite user
        </Button>
      </div>
      <Table>
        <thead>
          <tr>
            <Th>User</Th>
            <Th>Role</Th>
            <Th>Status</Th>
            <Th>Last sign-in</Th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => {
            const manageable = canManageRole(me.role, u.role) && u.id !== me.id;
            return (
              <tr key={u.id}>
                <Td>
                  <span className="block font-semibold">
                    {u.name}
                    {u.id === me.id ? " (you)" : ""}
                  </span>
                  <span className="text-xs text-muted">{u.email}</span>
                </Td>
                <Td>
                  {manageable ? (
                    <Select
                      aria-label={`Role for ${u.name}`}
                      defaultValue={u.role}
                      disabled={pending}
                      className="h-9 w-36"
                      onChange={(e) =>
                        run(() => changeRoleAction(u.id, e.target.value as Role), "Role updated")
                      }
                    >
                      {assignable.map((r) => (
                        <option key={r} value={r} className="capitalize">
                          {r}
                        </option>
                      ))}
                    </Select>
                  ) : (
                    <Badge tone="primary" className="capitalize">
                      {u.role}
                    </Badge>
                  )}
                </Td>
                <Td>
                  {manageable ? (
                    <Button
                      size="sm"
                      variant={u.active ? "outline" : "primary"}
                      disabled={pending}
                      onClick={() =>
                        run(
                          () => setActiveAction(u.id, !u.active),
                          u.active ? "User deactivated" : "User reactivated",
                        )
                      }
                    >
                      {u.active ? "Deactivate" : "Reactivate"}
                    </Button>
                  ) : (
                    <Badge tone={u.active ? "success" : "neutral"}>
                      {u.active ? "Active" : "Inactive"}
                    </Badge>
                  )}
                </Td>
                <Td className="text-sm text-muted">
                  {u.lastLoginAt ? formatDate(u.lastLoginAt, true) : "Never"}
                </Td>
              </tr>
            );
          })}
        </tbody>
      </Table>
      <dl className="mt-6 grid gap-2 text-sm sm:grid-cols-2">
        {ROLES.map((r) => (
          <div key={r} className="rounded-lg bg-card p-3">
            <dt className="font-semibold capitalize">{r}</dt>
            <dd className="text-muted">{ROLE_HELP[r]}</dd>
          </div>
        ))}
      </dl>
      <InviteModal open={inviteOpen} onClose={() => setInviteOpen(false)} roles={assignable} />
    </>
  );
}

function InviteModal({
  open,
  onClose,
  roles,
}: {
  open: boolean;
  onClose: () => void;
  roles: Role[];
}) {
  const toast = useToast();
  const [pending, start] = useTransition();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string>();
  const [link, setLink] = useState<string>();

  return (
    <Modal
      open={open}
      onClose={() => {
        setLink(undefined);
        onClose();
      }}
      title="Invite a user"
    >
      {link ? (
        <div className="space-y-3 text-sm">
          <p>
            Invitation created. We emailed a link to set their password. If the email doesn&apos;t
            arrive, share this link with them directly (valid for 7 days):
          </p>
          <Input
            readOnly
            value={link}
            onFocus={(e) => e.currentTarget.select()}
            aria-label="Invitation link"
          />
        </div>
      ) : (
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            start(async () => {
              const r = await inviteUserAction({
                name: String(fd.get("name")),
                email: String(fd.get("email")),
                role: String(fd.get("role")) as Role,
              });
              if (!r.ok) {
                setError(r.error);
                setErrors(
                  ("fieldErrors" in r && r.fieldErrors ? r.fieldErrors : {}) as Record<
                    string,
                    string
                  >,
                );
                return;
              }
              toast(
                r.emailError ? "User created, but the invitation email failed" : "Invitation sent",
                r.emailError ? "error" : "success",
              );
              setLink(r.inviteLink);
            });
          }}
        >
          <FormError message={error} />
          <Field id="inv-name" label="Name" error={errors.name}>
            <Input id="inv-name" name="name" required />
          </Field>
          <Field id="inv-email" label="Email" error={errors.email}>
            <Input id="inv-email" name="email" type="email" required />
          </Field>
          <Field id="inv-role" label="Role" error={errors.role}>
            <Select id="inv-role" name="role" defaultValue="editor">
              {roles.map((r) => (
                <option key={r} value={r} className="capitalize">
                  {r} — {ROLE_HELP[r]}
                </option>
              ))}
            </Select>
          </Field>
          <Button type="submit" disabled={pending}>
            {pending ? "Inviting…" : "Send invitation"}
          </Button>
        </form>
      )}
    </Modal>
  );
}
