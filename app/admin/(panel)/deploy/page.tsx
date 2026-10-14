import type { Metadata } from "next";
import { DeployPanel } from "@/components/admin/deploy-panel";
import { AdminPageTitle } from "@/components/admin/page-title";
import { requireActor } from "@/lib/auth/session";
import { deployConfig, readDeployStatus } from "@/lib/deploy";

export const metadata: Metadata = { title: "Deploy" };

export default async function DeployPage() {
  await requireActor("deploy:run");
  const status = await readDeployStatus();
  return (
    <>
      <AdminPageTitle
        title="Deploy"
        description="Check GitHub for new code and put it live. The site keeps running while the new version builds."
      />
      <DeployPanel initialStatus={status} enabled={deployConfig.enabled} />
    </>
  );
}
