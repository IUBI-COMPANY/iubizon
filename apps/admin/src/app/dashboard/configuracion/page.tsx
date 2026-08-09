"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ConfigPage() {
  const [settings, setSettings] = useState<any[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  useEffect(() => {
    fetch("/api/settings").then(r => r.json()).then(d => setSettings(d.settings || []));
  }, []);

  const handleEdit = (key: string, value: any) => {
    setEditing(key);
    setEditValue(JSON.stringify(value, null, 2));
  };

  const handleSave = async () => {
    if (!editing) return;
    try {
      const parsed = JSON.parse(editValue);
      await fetch("/api/settings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key: editing, value: parsed }) });
      setEditing(null);
      const res = await fetch("/api/settings");
      const d = await res.json();
      setSettings(d.settings || []);
    } catch {
      alert("JSON inválido");
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
        <p className="text-muted-foreground">Configuraciones globales de la plataforma</p>
      </div>
      <div className="space-y-4">
        {settings.map((s: any) => (
          <Card key={s.key}>
            <CardHeader>
              <CardTitle className="text-base">{s.key}</CardTitle>
              <CardDescription>{s.description}</CardDescription>
            </CardHeader>
            <CardContent>
              {editing === s.key ? (
                <div className="space-y-2">
                  <Label>JSON Value</Label>
                  <textarea className="w-full h-40 font-mono text-xs p-2 border rounded" value={editValue} onChange={(e) => setEditValue(e.target.value)} />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSave}>Guardar</Button>
                    <Button size="sm" variant="outline" onClick={() => setEditing(null)}>Cancelar</Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-4">
                  <pre className="text-xs bg-muted p-2 rounded flex-1 overflow-auto max-h-40">{JSON.stringify(s.value, null, 2)}</pre>
                  <Button size="sm" variant="outline" onClick={() => handleEdit(s.key, s.value)}>Editar</Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
