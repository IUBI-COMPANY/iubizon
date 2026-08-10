"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { IconLoader2, IconCheck } from "@tabler/icons-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";

const jsonSchema = z.string().refine(
  (val) => {
    try {
      JSON.parse(val);
      return true;
    } catch {
      return false;
    }
  },
  { message: "JSON inválido" },
);

export default function ConfigPage() {
  const [settings, setSettings] = useState<any[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(z.object({ json: jsonSchema })),
    defaultValues: { json: "" },
  });

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        setSettings(d.settings || []);
        setLoading(false);
      });
  }, []);

  const handleEdit = (key: string, value: unknown) => {
    setEditing(key);
    setValue("json", JSON.stringify(value, null, 2));
  };

  const onSubmit = async (data: { json: string }) => {
    if (!editing) return;
    try {
      const parsed = JSON.parse(data.json);
      await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: editing, value: parsed }),
      });
      setEditing(null);
      const res = await fetch("/api/settings");
      const d = await res.json();
      setSettings(d.settings || []);
    } catch {}
  };

  if (loading)
    return (
      <div className="flex justify-center p-8">
        <IconLoader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
        <p className="text-muted-foreground">
          Configuraciones globales de la plataforma
        </p>
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
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                  <FormField
                    name="json"
                    label="JSON Value"
                    error={errors.json?.message}
                  >
                    <textarea
                      className="w-full h-40 font-mono text-xs p-2 border rounded-md"
                      {...register("json")}
                    />
                  </FormField>
                  <div className="flex gap-2">
                    <Button type="submit" size="sm" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <IconLoader2 className="w-3 h-3 mr-1 animate-spin" />
                      ) : (
                        <IconCheck className="w-3 h-3 mr-1" />
                      )}
                      Guardar
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setEditing(null)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="flex items-start justify-between gap-4">
                  <pre className="text-xs bg-muted p-2 rounded flex-1 overflow-auto max-h-40">
                    {JSON.stringify(s.value, null, 2)}
                  </pre>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(s.key, s.value)}
                  >
                    Editar
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
