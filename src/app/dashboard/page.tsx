import { redirect } from "next/navigation";

import { Results } from "~/app/dashboard/_components/results";
import { isAdminRequest } from "~/server/admin";
import { api } from "~/trpc/server";

export default async function DashboardPage() {
  if (!(await isAdminRequest())) redirect("/dashboard/login");

  const rows = await api.registration.list();

  return <Results rows={rows} />;
}
