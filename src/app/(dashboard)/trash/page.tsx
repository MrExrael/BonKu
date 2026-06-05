import { TrashManager } from "@/components/settings/TrashManager";

export default function TrashPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Sampah</h1>
      </div>
      <TrashManager />
    </div>
  );
}
